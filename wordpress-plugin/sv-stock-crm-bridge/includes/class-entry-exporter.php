<?php
/**
 * Safe, Read-Only Historical Entry Exporter for WPForms 1.9.1.4
 */

if (!defined('ABSPATH')) {
    exit;
}

class SV_Stock_CRM_Entry_Exporter {

    public static function get_historical_entries(array $params = []): array {
        global $wpdb;

        $form_id = !empty($params['form_id']) ? sanitize_text_field($params['form_id']) : null;
        $limit   = !empty($params['limit']) ? min((int) $params['limit'], 100) : 50;
        $cursor  = !empty($params['cursor']) ? (int) $params['cursor'] : 0;

        $entries_table = $wpdb->prefix . 'wpforms_entries';

        // Check if WPForms table exists
        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $entries_table)) !== $entries_table) {
            return array(
                'entries' => [],
                'has_more' => false,
                'next_cursor' => null,
                'error' => 'WPForms entries table not found in WordPress database',
            );
        }

        $where = array('1=1');
        $args = array();

        if ($form_id) {
            $where[] = 'form_id = %d';
            $args[] = $form_id;
        }

        if ($cursor > 0) {
            $where[] = 'entry_id > %d';
            $args[] = $cursor;
        }

        $where_sql = implode(' AND ', $where);
        $sql = "SELECT entry_id, form_id, fields, date FROM $entries_table WHERE $where_sql ORDER BY entry_id ASC LIMIT %d";
        $args[] = $limit + 1;

        $results = $wpdb->get_results($wpdb->prepare($sql, ...$args));

        $has_more = count($results) > $limit;
        if ($has_more) {
            array_pop($results);
        }

        $formatted = array();
        $next_cursor = null;

        foreach ($results as $row) {
            $fields_data = maybe_unserialize($row->fields);
            if (is_string($fields_data)) {
                $fields_data = json_decode($fields_data, true) ?: array();
            }

            $formatted[] = array(
                'entryId'     => (string) $row->entry_id,
                'formId'      => (string) $row->form_id,
                'submittedAt' => gmdate('c', strtotime($row->date)),
                'fields'      => (array) $fields_data,
            );
            $next_cursor = (string) $row->entry_id;
        }

        return array(
            'entries'     => $formatted,
            'count'       => count($formatted),
            'has_more'    => $has_more,
            'next_cursor' => $has_more ? $next_cursor : null,
        );
    }
}
