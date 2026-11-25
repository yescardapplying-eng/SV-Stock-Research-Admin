<?php
/**
 * Plugin Name:       SV Stock Research Bridge
 * Plugin URI:        https://svstockresearch.in
 * Description:       Enterprise Bridge connecting WPForms (1.9.1.4+) directly and immutably to SV Stock Research Platform.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      8.0
 * Author:            SV Stock Research Engineering
 * License:           Proprietary
 * Text Domain:       sv-stock-crm-bridge
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

define('SV_STOCK_CRM_VERSION', '1.0.0');
define('SV_STOCK_CRM_PLUGIN_FILE', __FILE__);
define('SV_STOCK_CRM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SV_STOCK_CRM_PLUGIN_URL', plugin_dir_url(__FILE__));

// Require Core Plugin Class
require_once SV_STOCK_CRM_PLUGIN_DIR . 'includes/class-logger.php';
require_once SV_STOCK_CRM_PLUGIN_DIR . 'includes/class-security.php';
require_once SV_STOCK_CRM_PLUGIN_DIR . 'includes/class-outbox.php';
require_once SV_STOCK_CRM_PLUGIN_DIR . 'includes/class-webhook-client.php';
require_once SV_STOCK_CRM_PLUGIN_DIR . 'includes/class-entry-exporter.php';
require_once SV_STOCK_CRM_PLUGIN_DIR . 'includes/class-rest-controller.php';
require_once SV_STOCK_CRM_PLUGIN_DIR . 'includes/class-admin-settings.php';
require_once SV_STOCK_CRM_PLUGIN_DIR . 'includes/class-wpforms-listener.php';
require_once SV_STOCK_CRM_PLUGIN_DIR . 'includes/class-plugin.php';

/**
 * Plugin activation hook: Creates outbox table & schedules cron
 */
register_activation_hook(__FILE__, function () {
    SV_Stock_CRM_Outbox::create_tables();
    if (!wp_next_scheduled('sv_stock_crm_dispatch_outbox_cron')) {
        wp_schedule_event(time(), 'every_minute', 'sv_stock_crm_dispatch_outbox_cron');
    }
});

/**
 * Plugin deactivation hook: Clears scheduled cron
 */
register_deactivation_hook(__FILE__, function () {
    wp_clear_scheduled_hook('sv_stock_crm_dispatch_outbox_cron');
});

// Custom cron recurrence if not already defined
add_filter('cron_schedules', function ($schedules) {
    if (!isset($schedules['every_minute'])) {
        $schedules['every_minute'] = array(
            'interval' => 60,
            'display'  => __('Every Minute', 'sv-stock-crm-bridge')
        );
    }
    return $schedules;
});

// Initialize plugin
function sv_stock_crm_init() {
    SV_Stock_CRM_Plugin::get_instance();
}
add_action('plugins_loaded', 'sv_stock_crm_init');
