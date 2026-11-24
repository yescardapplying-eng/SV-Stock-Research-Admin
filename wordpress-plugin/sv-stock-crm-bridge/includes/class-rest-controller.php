<?php
/**
 * Custom Secure REST API Controller
 */

if (!defined('ABSPATH')) {
    exit;
}

class SV_Stock_CRM_REST_Controller {

    const NAMESPACE = 'sv-stock-crm/v1';

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes(): void {
        register_rest_route(self::NAMESPACE, '/entries', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_entries'),
            'permission_callback' => array($this, 'check_pull_permission'),
        ));

        register_rest_route(self::NAMESPACE, '/health', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_health'),
            'permission_callback' => '__return_true',
        ));
    }

    public function check_pull_permission(WP_REST_Request $request): bool {
        // Allow logged-in WordPress administrators
        if (current_user_can('manage_options')) {
            return true;
        }

        // Allow authenticated Render server via signed HMAC request
        $pull_secret = SV_Stock_CRM_Security::get_pull_secret();
        if ($pull_secret && SV_Stock_CRM_Security::verify_incoming_signature($request, $pull_secret)) {
            return true;
        }

        return false;
    }

    public function get_entries(WP_REST_Request $request): WP_REST_Response {
        $params = array(
            'form_id' => $request->get_param('form_id'),
            'limit'   => $request->get_param('limit'),
            'cursor'  => $request->get_param('cursor'),
        );

        $data = SV_Stock_CRM_Entry_Exporter::get_historical_entries($params);
        return new WP_REST_Response($data, 200);
    }

    public function get_health(): WP_REST_Response {
        return new WP_REST_Response(array(
            'status'         => 'ok',
            'version'        => SV_STOCK_CRM_VERSION,
            'wpforms_active' => function_exists('wpforms'),
            'siteIdentifier' => SV_Stock_CRM_Security::get_site_identifier(),
            'timestamp'      => time(),
        ), 200);
    }
}
