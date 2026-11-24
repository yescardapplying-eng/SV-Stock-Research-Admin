<?php
/**
 * Reliable Signed Webhook Dispatcher
 */

if (!defined('ABSPATH')) {
    exit;
}

class SV_Stock_CRM_Webhook_Client {

    public function dispatch_pending_outbox(int $batch_size = 15): void {
        global $wpdb;
        $table = SV_Stock_CRM_Outbox::get_table_name();
        $now = current_time('mysql', 1);

        $pending = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table 
                 WHERE status = 'pending' AND (next_retry_at IS NULL OR next_retry_at <= %s) 
                 ORDER BY id ASC LIMIT %d",
                $now,
                $batch_size
            )
        );

        if (empty($pending)) {
            return;
        }

        $backend_url = SV_Stock_CRM_Security::get_backend_api_url();
        $webhook_secret = SV_Stock_CRM_Security::get_webhook_secret();
        $site_id = SV_Stock_CRM_Security::get_site_identifier();

        foreach ($pending as $row) {
            $timestamp = (string) time();
            $signature = SV_Stock_CRM_Security::generate_signature($row->payload, $timestamp, $webhook_secret);

            $endpoint = trailingslashit($backend_url) . 'api/webhooks/wordpress/entries';

            $response = wp_remote_post($endpoint, array(
                'timeout' => 15,
                'headers' => array(
                    'Content-Type'         => 'application/json; charset=utf-8',
                    'x-sv-crm-timestamp'   => $timestamp,
                    'x-sv-crm-site'        => $site_id,
                    'x-sv-crm-signature'   => $signature,
                    'x-sv-crm-request-id'  => $row->event_id,
                ),
                'body' => $row->payload,
            ));

            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) >= 200 && wp_remote_retrieve_response_code($response) < 300) {
                // Success: Mark completed
                $wpdb->update(
                    $table,
                    array('status' => 'completed', 'last_error' => null),
                    array('id' => $row->id),
                    array('%s', '%s'),
                    array('%d')
                );
            } else {
                // Failure: Exponential backoff
                $retries = (int) $row->retry_count + 1;
                $delay_minutes = min(pow(2, $retries), 1440); // Max 24 hours
                $next_retry = gmdate('Y-m-d H:i:s', time() + ($delay_minutes * 60));
                $error_msg = is_wp_error($response) ? $response->get_error_message() : 'HTTP Code ' . wp_remote_retrieve_response_code($response);

                $wpdb->update(
                    $table,
                    array(
                        'retry_count'   => $retries,
                        'next_retry_at' => $next_retry,
                        'last_error'    => $error_msg,
                        'status'        => $retries >= 10 ? 'failed' : 'pending',
                    ),
                    array('id' => $row->id),
                    array('%d', '%s', '%s', '%s'),
                    array('%d')
                );

                SV_Stock_CRM_Logger::error("Outbox webhook delivery failed for Event {$row->event_id}: $error_msg");
            }
        }
    }
}
