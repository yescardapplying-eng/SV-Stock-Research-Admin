<?php
/**
 * WordPress Admin Settings, Outbox Management & Historical Lead Importer
 */

if (!defined('ABSPATH')) {
    exit;
}

class SV_Stock_CRM_Admin_Settings {

    public function __construct() {
        add_action('admin_menu', array($this, 'add_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('wp_ajax_sv_stock_crm_sync_batch', array($this, 'ajax_sync_batch'));
    }

    public function add_menu(): void {
        add_options_page(
            __('SV Stock Research Bridge', 'sv-stock-crm-bridge'),
            __('SV Stock Research Bridge', 'sv-stock-crm-bridge'),
            'manage_options',
            'sv-stock-crm-settings',
            array($this, 'render_page')
        );
    }

    public function register_settings(): void {
        register_setting('sv_stock_crm_group', 'sv_stock_crm_backend_url');
        register_setting('sv_stock_crm_group', 'sv_stock_crm_site_identifier');
        register_setting('sv_stock_crm_group', 'sv_stock_crm_webhook_secret');
        register_setting('sv_stock_crm_group', 'sv_stock_crm_pull_secret');
    }

    /**
     * AJAX handler for batch historical lead synchronization
     */
    public function ajax_sync_batch(): void {
        check_ajax_referer('sv_stock_crm_sync_nonce', 'security');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'), 403);
        }

        global $wpdb;
        $entries_table = $wpdb->prefix . 'wpforms_entries';
        $cursor = isset($_POST['cursor']) ? (int) $_POST['cursor'] : 0;
        $batch_size = 50;

        $total_entries = (int) $wpdb->get_var("SELECT COUNT(*) FROM $entries_table");

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT entry_id, form_id, fields, date FROM $entries_table 
                 WHERE entry_id > %d ORDER BY entry_id ASC LIMIT %d",
                $cursor,
                $batch_size
            )
        );

        if (empty($rows)) {
            wp_send_json_success(array(
                'done'       => true,
                'total'      => $total_entries,
                'processed'  => 0,
                'next_cursor' => $cursor,
            ));
        }

        $formatted = array();
        $last_id = $cursor;

        foreach ($rows as $row) {
            $fields_data = maybe_unserialize($row->fields);
            if (is_string($fields_data)) {
                $fields_data = json_decode($fields_data, true) ?: array();
            }

            $form_title = get_the_title($row->form_id);
            if (!$form_title) {
                $form_title = 'Form #' . $row->form_id;
            }

            $formatted[] = array(
                'formId'      => (string) $row->form_id,
                'formName'    => (string) $form_title,
                'entryId'     => (string) $row->entry_id,
                'submittedAt' => gmdate('c', strtotime($row->date)),
                'fields'      => (array) $fields_data,
            );
            $last_id = (int) $row->entry_id;
        }

        $backend_url = SV_Stock_CRM_Security::get_backend_api_url();
        $site_id = SV_Stock_CRM_Security::get_site_identifier();
        $endpoint = trailingslashit($backend_url) . 'api/webhooks/wordpress/entries/batch';

        $batch_payload = array(
            'siteIdentifier' => $site_id,
            'entries'        => $formatted,
        );

        $json_payload = wp_json_encode($batch_payload);
        $timestamp = (string) time();
        $webhook_secret = SV_Stock_CRM_Security::get_webhook_secret();
        $signature = $webhook_secret ? SV_Stock_CRM_Security::generate_signature($json_payload, $timestamp, $webhook_secret) : '';

        $response = wp_remote_post($endpoint, array(
            'timeout' => 30,
            'headers' => array(
                'Content-Type'        => 'application/json; charset=utf-8',
                'x-sv-crm-timestamp'  => $timestamp,
                'x-sv-crm-site'       => $site_id,
                'x-sv-crm-signature'  => $signature,
                'x-sv-crm-request-id' => 'batch_' . time() . '_' . $last_id,
            ),
            'body' => $json_payload,
        ));

        if (is_wp_error($response)) {
            wp_send_json_error(array('message' => $response->get_error_message()));
        }

        $code = wp_remote_retrieve_response_code($response);
        if ($code < 200 || $code >= 300) {
            $body = wp_remote_retrieve_body($response);
            wp_send_json_error(array('message' => "API returned HTTP $code: $body"));
        }

        $remaining = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $entries_table WHERE entry_id > %d", $last_id));

        wp_send_json_success(array(
            'done'        => $remaining === 0,
            'processed'   => count($formatted),
            'next_cursor' => $last_id,
            'remaining'   => $remaining,
            'total'       => $total_entries,
        ));
    }

    public function render_page(): void {
        global $wpdb;
        $table = SV_Stock_CRM_Outbox::get_table_name();
        $entries_table = $wpdb->prefix . 'wpforms_entries';

        // Handle manual dispatch button
        if (isset($_POST['sv_stock_crm_dispatch_now']) && check_admin_referer('sv_stock_crm_action')) {
            $client = new SV_Stock_CRM_Webhook_Client();
            $client->dispatch_pending_outbox(50);
            echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Outbox dispatch initiated.', 'sv-stock-crm-bridge') . '</p></div>';
        }

        $pending_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM $table WHERE status = 'pending'");
        $completed_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM $table WHERE status = 'completed'");
        $failed_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM $table WHERE status = 'failed'");

        $total_historical = 0;
        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $entries_table)) === $entries_table) {
            $total_historical = (int) $wpdb->get_var("SELECT COUNT(*) FROM $entries_table");
        }
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('SV Stock Research Bridge Settings', 'sv-stock-crm-bridge'); ?></h1>
            <p><?php echo esc_html__('Connects WPForms 1.9.1.4 submissions directly and immutably to SV Stock Research Platform.', 'sv-stock-crm-bridge'); ?></p>

            <!-- 1. Historical Sync Card -->
            <div style="background: #fff; border: 1px solid #10b981; border-left: 5px solid #10b981; padding: 20px; margin: 20px 0; max-width: 800px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h2 style="margin-top: 0; color: #065f46; display: flex; align-items: center; gap: 8px;">
                    <span>📥</span> <?php echo esc_html__('Historical WPForms Leads Import to Platform', 'sv-stock-crm-bridge'); ?>
                </h2>
                <p>
                    WordPress database me total <strong><?php echo esc_html(number_format_i18n($total_historical)); ?></strong> WPForms entries exist karti hain (Lead form sv stock, Contact, Consent).
                    Aap ek click me sabhi existing leads ko SV Stock Research Platform me safe aur idempotent tarike se import kar sakte hain.
                </p>

                <div id="sv-crm-progress-container" style="display: none; margin: 15px 0;">
                    <div style="background: #e2e8f0; border-radius: 8px; overflow: hidden; height: 24px; position: relative;">
                        <div id="sv-crm-progress-bar" style="background: #10b981; width: 0%; height: 100%; transition: width 0.3s ease;"></div>
                        <span id="sv-crm-progress-text" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #0f172a;">0%</span>
                    </div>
                    <p id="sv-crm-status-msg" style="margin-top: 8px; font-size: 13px; color: #475569; font-weight: 500;"></p>
                </div>

                <div style="margin-top: 15px;">
                    <button type="button" id="sv-crm-start-import-btn" class="button button-primary" style="background: #10b981; border-color: #059669; font-weight: 600; padding: 4px 16px; height: 34px;">
                        🚀 <?php esc_html_e('Sync All Existing Leads to Platform (1,800+ leads)', 'sv-stock-crm-bridge'); ?>
                    </button>
                    <span id="sv-crm-spinner" class="spinner" style="float: none; margin-left: 8px; vertical-align: middle;"></span>
                </div>
            </div>

            <!-- 2. Real-Time Outbox Card -->
            <div style="background: #fff; border: 1px solid #ccd0d4; padding: 15px; margin: 20px 0; max-width: 800px; border-radius: 4px;">
                <h2 style="margin-top: 0;"><?php echo esc_html__('Live Webhook Outbox Status', 'sv-stock-crm-bridge'); ?></h2>
                <p>
                    <strong><?php echo esc_html__('Pending Deliveries:', 'sv-stock-crm-bridge'); ?></strong> <?php echo esc_html($pending_count); ?> &nbsp;|&nbsp;
                    <strong><?php echo esc_html__('Completed Deliveries:', 'sv-stock-crm-bridge'); ?></strong> <?php echo esc_html($completed_count); ?> &nbsp;|&nbsp;
                    <strong><?php echo esc_html__('Failed Retries:', 'sv-stock-crm-bridge'); ?></strong> <?php echo esc_html($failed_count); ?>
                </p>
                <form method="post" style="margin-top: 10px;">
                    <?php wp_nonce_field('sv_stock_crm_action'); ?>
                    <input type="submit" name="sv_stock_crm_dispatch_now" class="button button-secondary" value="<?php esc_attr_e('Dispatch Outbox Now', 'sv-stock-crm-bridge'); ?>">
                </form>
            </div>

            <!-- 3. Connection Settings Form -->
            <form method="post" action="options.php" style="max-width: 800px;">
                <?php
                settings_fields('sv_stock_crm_group');
                do_settings_sections('sv_stock_crm_group');
                ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php echo esc_html__('Render Backend API URL', 'sv-stock-crm-bridge'); ?></th>
                        <td>
                            <input type="url" name="sv_stock_crm_backend_url" value="<?php echo esc_attr(get_option('sv_stock_crm_backend_url', 'https://sv-stock-crm-api.onrender.com')); ?>" class="regular-text" style="width: 100%; max-width: 450px;">
                            <p class="description"><?php echo esc_html__('Default: https://sv-stock-crm-api.onrender.com', 'sv-stock-crm-bridge'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php echo esc_html__('Site Identifier', 'sv-stock-crm-bridge'); ?></th>
                        <td>
                            <input type="text" name="sv_stock_crm_site_identifier" value="<?php echo esc_attr(get_option('sv_stock_crm_site_identifier', 'sv-stock-research-main')); ?>" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php echo esc_html__('Webhook Secret (HMAC-SHA256)', 'sv-stock-crm-bridge'); ?></th>
                        <td>
                            <input type="password" name="sv_stock_crm_webhook_secret" value="<?php echo esc_attr(get_option('sv_stock_crm_webhook_secret', '')); ?>" class="regular-text">
                            <p class="description"><?php echo esc_html__('Shared secret for signing outgoing submissions to Render API (leave blank if not set in API).', 'sv-stock-crm-bridge'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php echo esc_html__('Historical Pull Secret (HMAC-SHA256)', 'sv-stock-crm-bridge'); ?></th>
                        <td>
                            <input type="password" name="sv_stock_crm_pull_secret" value="<?php echo esc_attr(get_option('sv_stock_crm_pull_secret', '')); ?>" class="regular-text">
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>

        <script>
        document.addEventListener('DOMContentLoaded', function () {
            var btn = document.getElementById('sv-crm-start-import-btn');
            var container = document.getElementById('sv-crm-progress-container');
            var bar = document.getElementById('sv-crm-progress-bar');
            var text = document.getElementById('sv-crm-progress-text');
            var statusMsg = document.getElementById('sv-crm-status-msg');
            var spinner = document.getElementById('sv-crm-spinner');

            if (!btn) return;

            var cursor = 0;
            var total = <?php echo (int) $total_historical; ?>;
            var totalProcessed = 0;

            btn.addEventListener('click', function () {
                if (!confirm('Kya aap sabhi existing WPForms leads ko CRM me sync karna chahte hain?')) {
                    return;
                }

                btn.disabled = true;
                spinner.classList.add('is-active');
                container.style.display = 'block';
                statusMsg.textContent = 'Starting batch synchronization with Render API...';

                function runBatch() {
                    var formData = new FormData();
                    formData.append('action', 'sv_stock_crm_sync_batch');
                    formData.append('security', '<?php echo wp_create_nonce('sv_stock_crm_sync_nonce'); ?>');
                    formData.append('cursor', cursor);

                    fetch(ajaxurl, {
                        method: 'POST',
                        body: formData
                    })
                    .then(function (res) { return res.json(); })
                    .then(function (response) {
                        if (!response.success) {
                            statusMsg.textContent = 'Error: ' + (response.data ? response.data.message : 'Unknown error');
                            statusMsg.style.color = '#dc2626';
                            btn.disabled = false;
                            spinner.classList.remove('is-active');
                            return;
                        }

                        var data = response.data;
                        cursor = data.next_cursor;
                        totalProcessed += data.processed;
                        var totalEntries = data.total || total || 1;
                        var pct = Math.min(Math.round((totalProcessed / totalEntries) * 100), 100);

                        bar.style.width = pct + '%';
                        text.textContent = pct + '% (' + totalProcessed + ' / ' + totalEntries + ')';
                        statusMsg.textContent = 'Syncing... Processed ' + totalProcessed + ' leads. Remaining: ' + (data.remaining || 0);

                        if (data.done || data.remaining === 0) {
                            bar.style.width = '100%';
                            text.textContent = '100% (' + totalProcessed + ' Leads Synced)';
                            statusMsg.textContent = '✅ Success! All ' + totalProcessed + ' historical leads have been safely synced to Render CRM!';
                            statusMsg.style.color = '#059669';
                            btn.textContent = '✅ Sync Complete (' + totalProcessed + ' Leads)';
                            spinner.classList.remove('is-active');
                        } else {
                            // Run next batch
                            setTimeout(runBatch, 200);
                        }
                    })
                    .catch(function (err) {
                        statusMsg.textContent = 'Network error: ' + err.message;
                        statusMsg.style.color = '#dc2626';
                        btn.disabled = false;
                        spinner.classList.remove('is-active');
                    });
                }

                runBatch();
            });
        });
        </script>
        <?php
    }
}
