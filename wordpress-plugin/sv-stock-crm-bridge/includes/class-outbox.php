<?php
/**
 * Outbox Table Management using dbDelta
 */

if (!defined('ABSPATH')) {
    exit;
}

class SV_Stock_CRM_Outbox {

    public static function get_table_name(): string {
        global $wpdb;
        return $wpdb->prefix . 'sv_stock_crm_outbox';
    }

    public static function create_tables(): void {
        global $wpdb;
        $table_name = self::get_table_name();
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            event_id varchar(100) NOT NULL,
            form_id varchar(50) NOT NULL,
            entry_id varchar(50) NOT NULL,
            event_type varchar(50) NOT NULL DEFAULT 'wpforms_submission',
            payload longtext NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            retry_count int(11) NOT NULL DEFAULT 0,
            next_retry_at datetime DEFAULT NULL,
            last_error text DEFAULT NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY event_id (event_id),
            KEY status_retry (status, next_retry_at),
            KEY form_entry (form_id, entry_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }

    public static function enqueue(string $form_id, string $entry_id, array $payload): ?int {
        global $wpdb;
        $table = self::get_table_name();
        $event_id = sprintf('wp_evt_%d_%s_%s', time(), $form_id, $entry_id);

        $inserted = $wpdb->insert(
            $table,
            array(
                'event_id'      => $event_id,
                'form_id'       => (string) $form_id,
                'entry_id'      => (string) $entry_id,
                'payload'       => wp_json_encode($payload),
                'status'        => 'pending',
                'retry_count'   => 0,
                'next_retry_at' => current_time('mysql', 1),
            ),
            array('%s', '%s', '%s', '%s', '%s', '%d', '%s')
        );

        return $inserted ? $wpdb->insert_id : null;
    }
}
