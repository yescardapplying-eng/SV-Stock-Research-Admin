<?php
/**
 * Main Singleton Plugin Controller
 */

if (!defined('ABSPATH')) {
    exit;
}

class SV_Stock_CRM_Plugin {

    private static ?SV_Stock_CRM_Plugin $instance = null;

    public static function get_instance(): SV_Stock_CRM_Plugin {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->init_components();
    }

    private function init_components(): void {
        // Initialize Logger & Security
        SV_Stock_CRM_Logger::init();

        // Listen for WPForms submissions
        new SV_Stock_CRM_WPForms_Listener();

        // Register custom secure REST routes
        new SV_Stock_CRM_REST_Controller();

        // Register WordPress Admin settings interface
        if (is_admin()) {
            new SV_Stock_CRM_Admin_Settings();
        }

        // Register cron worker for outbox delivery
        add_action('sv_stock_crm_dispatch_outbox_cron', array($this, 'run_outbox_worker'));
    }

    public function run_outbox_worker(): void {
        $client = new SV_Stock_CRM_Webhook_Client();
        $client->dispatch_pending_outbox();
    }
}
