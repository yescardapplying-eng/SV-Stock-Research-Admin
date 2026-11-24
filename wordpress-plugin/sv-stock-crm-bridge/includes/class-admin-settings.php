<?php
/**
 * WordPress Admin Settings & Outbox Management Interface
 */

if (!defined('ABSPATH')) {
    exit;
}

class SV_Stock_CRM_Admin_Settings {

    public function __construct() {
        add_action('admin_menu', array($this, 'add_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    public function add_menu(): void {
        add_options_page(
            __('SV Stock CRM Bridge', 'sv-stock-crm-bridge'),
            __('SV Stock CRM', 'sv-stock-crm-bridge'),
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

    public function render_page(): void {
        global $wpdb;
        $table = SV_Stock_CRM_Outbox::get_table_name();

        // Handle manual dispatch button
        if (isset($_POST['sv_stock_crm_dispatch_now']) && check_admin_referer('sv_stock_crm_action')) {
            $client = new SV_Stock_CRM_Webhook_Client();
            $client->dispatch_pending_outbox(50);
            echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Outbox dispatch initiated.', 'sv-stock-crm-bridge') . '</p></div>';
        }

        $pending_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM $table WHERE status = 'pending'");
        $completed_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM $table WHERE status = 'completed'");
        $failed_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM $table WHERE status = 'failed'");
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('SV Stock CRM Bridge Settings', 'sv-stock-crm-bridge'); ?></h1>
            <p><?php echo esc_html__('Connects WPForms 1.9.1.4 submissions to Render CRM with immutable data protection.', 'sv-stock-crm-bridge'); ?></p>

            <div style="background: #fff; border: 1px solid #ccd0d4; padding: 15px; margin: 20px 0; max-width: 800px; border-radius: 4px;">
                <h2><?php echo esc_html__('Synchronization Outbox Status', 'sv-stock-crm-bridge'); ?></h2>
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

            <form method="post" action="options.php" style="max-width: 800px;">
                <?php
                settings_fields('sv_stock_crm_group');
                do_settings_sections('sv_stock_crm_group');
                ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php echo esc_html__('Render Backend API URL', 'sv-stock-crm-bridge'); ?></th>
                        <td>
                            <input type="url" name="sv_stock_crm_backend_url" value="<?php echo esc_attr(get_option('sv_stock_crm_backend_url', 'http://localhost:4000')); ?>" class="regular-text">
                            <p class="description"><?php echo esc_html__('Your Render backend service URL (e.g. https://api.svstockresearch.onrender.com)', 'sv-stock-crm-bridge'); ?></p>
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
                            <p class="description"><?php echo esc_html__('Shared secret for signing outgoing submissions to Render API.', 'sv-stock-crm-bridge'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php echo esc_html__('Historical Pull Secret (HMAC-SHA256)', 'sv-stock-crm-bridge'); ?></th>
                        <td>
                            <input type="password" name="sv_stock_crm_pull_secret" value="<?php echo esc_attr(get_option('sv_stock_crm_pull_secret', '')); ?>" class="regular-text">
                            <p class="description"><?php echo esc_html__('Secret for authenticating CRM requests to export historical entries.', 'sv-stock-crm-bridge'); ?></p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}
