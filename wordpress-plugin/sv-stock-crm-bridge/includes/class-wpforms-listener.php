<?php
/**
 * WPForms 1.9.1.4+ Submission Listener
 */

if (!defined('ABSPATH')) {
    exit;
}

class SV_Stock_CRM_WPForms_Listener {

    public function __construct() {
        // Standard documented WPForms hook: 4 arguments
        add_action('wpforms_process_complete', array($this, 'on_wpforms_process_complete'), 10, 4);
    }

    /**
     * @param array $fields Form fields submitted and sanitized by WPForms
     * @param array $entry Entry data
     * @param array $form_data Full form configuration and schema
     * @param int $entry_id WPForms entry ID
     */
    public function on_wpforms_process_complete(array $fields, array $entry, array $form_data, $entry_id): void {
        try {
            $form_id = $form_data['id'] ?? 'unknown';
            $form_name = $form_data['settings']['form_title'] ?? ('Form #' . $form_id);

            // Structure comprehensive payload preserving all original fields
            $payload = array(
                'siteIdentifier' => SV_Stock_CRM_Security::get_site_identifier(),
                'formId'         => (string) $form_id,
                'formName'       => (string) $form_name,
                'entryId'        => (string) $entry_id,
                'submittedAt'    => gmdate('c'),
                'fields'         => $fields,
                'userIp'         => sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? ''),
                'userAgent'      => sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? ''),
            );

            // Enqueue into dedicated outbox table (non-blocking)
            SV_Stock_CRM_Outbox::enqueue((string) $form_id, (string) $entry_id, $payload);
            SV_Stock_CRM_Logger::info("WPForms submission enqueued to outbox: Form {$form_id}, Entry {$entry_id}");

            // Immediate real-time delivery attempt (fast path)
            $client = new SV_Stock_CRM_Webhook_Client();
            $client->dispatch_pending_outbox(5);

            // Fallback scheduled event for retry if server was asleep
            wp_schedule_single_event(time() + 60, 'sv_stock_crm_dispatch_outbox_cron');

        } catch (Throwable $e) {
            SV_Stock_CRM_Logger::error("Error capturing WPForms submission: " . $e->getMessage(), array(
                'form_id' => $form_data['id'] ?? null,
                'entry_id' => $entry_id ?? null,
            ));
        }
    }
}
