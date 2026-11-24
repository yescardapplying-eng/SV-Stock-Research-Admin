<?php
/**
 * Safe Logger preventing credential leakage
 */

if (!defined('ABSPATH')) {
    exit;
}

class SV_Stock_CRM_Logger {

    private static string $log_file = '';

    public static function init(): void {
        $upload_dir = wp_upload_dir();
        $dir = trailingslashit($upload_dir['basedir']) . 'sv-stock-crm-logs';
        if (!file_exists($dir)) {
            wp_mkdir_p($dir);
            file_put_contents($dir . '/.htaccess', "Order Deny,Allow\nDeny from all");
            file_put_contents($dir . '/index.php', '<?php // Silence is golden');
        }
        self::$log_file = $dir . '/bridge.log';
    }

    public static function log(string $level, string $message, array $context = []): void {
        if (!self::$log_file) {
            self::init();
        }

        // Redact secrets and passwords
        $sanitized_context = self::redact_sensitive_data($context);

        $line = sprintf(
            "[%s] [%s] %s %s\n",
            gmdate('Y-m-d H:i:s'),
            strtoupper($level),
            $message,
            !empty($sanitized_context) ? json_encode($sanitized_context) : ''
        );

        @error_log($line, 3, self::$log_file);
    }

    public static function info(string $message, array $context = []): void {
        self::log('INFO', $message, $context);
    }

    public static function error(string $message, array $context = []): void {
        self::log('ERROR', $message, $context);
    }

    private static function redact_sensitive_data(array $data): array {
        $sensitive_keys = ['secret', 'webhook_secret', 'pull_secret', 'password', 'token', 'authorization'];
        foreach ($data as $key => $val) {
            if (is_array($val)) {
                $data[$key] = self::redact_sensitive_data($val);
            } elseif (in_array(strtolower($key), $sensitive_keys, true)) {
                $data[$key] = '***REDACTED***';
            }
        }
        return $data;
    }
}
