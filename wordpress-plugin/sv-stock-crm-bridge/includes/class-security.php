<?php
/**
 * Security, Request Signing, and Verification
 */

if (!defined('ABSPATH')) {
    exit;
}

class SV_Stock_CRM_Security {

    public static function get_webhook_secret(): string {
        if (defined('SV_STOCK_CRM_WEBHOOK_SECRET') && SV_STOCK_CRM_WEBHOOK_SECRET) {
            return SV_STOCK_CRM_WEBHOOK_SECRET;
        }
        return (string) get_option('sv_stock_crm_webhook_secret', '');
    }

    public static function get_pull_secret(): string {
        if (defined('SV_STOCK_CRM_PULL_SECRET') && SV_STOCK_CRM_PULL_SECRET) {
            return SV_STOCK_CRM_PULL_SECRET;
        }
        return (string) get_option('sv_stock_crm_pull_secret', '');
    }

    public static function get_backend_api_url(): string {
        if (defined('SV_STOCK_CRM_BACKEND_URL') && SV_STOCK_CRM_BACKEND_URL) {
            return rtrim(SV_STOCK_CRM_BACKEND_URL, '/');
        }
        return rtrim((string) get_option('sv_stock_crm_backend_url', 'https://sv-stock-crm-api.onrender.com'), '/');
    }

    public static function get_site_identifier(): string {
        if (defined('SV_STOCK_CRM_SITE_IDENTIFIER') && SV_STOCK_CRM_SITE_IDENTIFIER) {
            return SV_STOCK_CRM_SITE_IDENTIFIER;
        }
        return (string) get_option('sv_stock_crm_site_identifier', 'sv-stock-research-main');
    }

    public static function generate_signature(string $payload, string $timestamp, string $secret): string {
        $canonical = $timestamp . '.' . $payload;
        return hash_hmac('sha256', $canonical, $secret);
    }

    public static function verify_incoming_signature(WP_REST_Request $request, string $secret): bool {
        $timestamp = $request->get_header('x-sv-crm-timestamp');
        $signature = $request->get_header('x-sv-crm-signature');

        if (!$timestamp || !$signature || !$secret) {
            return false;
        }

        // Replay protection: 300 seconds window
        $current_time = time();
        if (abs($current_time - (int) $timestamp) > 300) {
            return false;
        }

        $raw_body = $request->get_body();
        $expected = self::generate_signature($raw_body, $timestamp, $secret);

        return hash_equals($expected, $signature);
    }
}
