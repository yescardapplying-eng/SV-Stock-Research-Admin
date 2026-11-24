# Troubleshooting Guide

Common issues and remediation procedures for SV Stock Research CRM.

## 1. Webhook Signature Mismatch
- **Symptom**: `401 Unauthorized: Invalid or expired HMAC webhook signature`.
- **Causes**:
  - `WP_WEBHOOK_SECRET` on Render does not match the secret in WordPress `wp-config.php` or Plugin Settings.
  - Server clocks between Hostinger and Render drift by more than 300 seconds (5 minutes).
- **Remedy**: Verify secret strings match exactly and check NTP server synchronization on hosting.

## 2. WPForms Entries Not Captured
- **Symptom**: Submissions appear in WordPress but not in CRM.
- **Check**:
  - Navigate to WordPress Admin -> **Settings** -> **SV Stock CRM**.
  - Check the Outbox Status table. If deliveries are marked "Pending", verify that WP-Cron is functioning on Hostinger.
  - Click **Dispatch Outbox Now** to trigger an immediate queue flush.

## 3. Database Connection Failure on Render
- **Symptom**: `PrismaClientInitializationError: Can't reach database server`.
- **Remedy**: Ensure `DATABASE_URL` is set to the internal connection string of `sv-stock-crm-db` within the Render internal network.
