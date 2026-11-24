=== SV Stock CRM Bridge ===
Contributors: SV Stock Research Engineering
Tags: wpforms, crm, render, lead-management, synchronization
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 8.0
Stable tag: 1.0.0
License: Proprietary

Connects WordPress WPForms 1.9.1.4+ directly and securely to the Render-hosted SV Stock Research CRM.

== Description ==

SV Stock CRM Bridge bridges WPForms submissions to a dedicated PostgreSQL CRM on Render.
Key features:
* Asynchronous outbox delivery (never blocks visitor form submission).
* HMAC-SHA256 request signing with timestamp replay protection.
* Secure paginated historical export endpoint for zero-loss migration.
* Strict immutability: Original WPForms database records are never modified or deleted.

== Installation ==

1. Upload the `sv-stock-crm-bridge` folder to `/wp-content/plugins/`.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Navigate to Settings -> SV Stock CRM to configure your Render backend URL and HMAC secrets.
