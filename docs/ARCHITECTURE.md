# Architecture & System Design

```
+-------------------------------------------------------------+
|                  WordPress (Hostinger)                      |
|                  https://svstockresearch.in                 |
|                                                             |
|  [ WPForms 1.9.1.4 ]                                        |
|         │                                                   |
|         ▼ (wpforms_process_complete)                        |
|  [ SV Stock CRM Bridge ]                                    |
|         │                                                   |
|         ├─► Dedicated Outbox Table (wp_sv_stock_crm_outbox) |
|         │         │                                         |
|         │         ▼ (WP-Cron / Immediate Async Dispatch)    |
|         │    [ Signed Webhook Client ]                      |
|         │                                                   |
|         └─► [ Read-Only Export Endpoint ]                   |
|               (/wp-json/sv-stock-crm/v1/entries)            |
+─────────────────────┬───────────────────────────────────────+
                      │
           HMAC-SHA256 Signed Requests
           X-SV-CRM-Timestamp & Request-ID
                      │
                      ▼
+─────────────────────────────────────────────────────────────+
|                     Render Cloud                            |
|                                                             |
|  [ NestJS Backend API (apps/api) ]                          |
|    ├── Webhooks Ingestion (Idempotent SyncEvent)            |
|    ├── Historical Entry Importer (Batched Cursor Engine)    |
|    ├── Lead Management & Status Engine                      |
|    └── Admin Authentication & Audit Logging                 |
|               │                                             |
|               ▼ (Prisma ORM)                                |
|  [ PostgreSQL Database (Render Managed) ]                   |
|    ├── SourceEntry (Immutable WP Snapshot)                  |
|    ├── LeadManagement (CRM Status & Tracking)               |
|    ├── LeadOverride (CRM Corrected Fields)                  |
|    └── LeadNote & ActivityTimeline                          |
|               ▲                                             |
|               │ (Internal / Protected REST API)             |
|  [ Next.js Admin Dashboard (apps/admin) ]                   |
|    ├── Live Metric Cards & Status Distribution              |
|    ├── All Leads Table (Search, Filters, Pagination)        |
|    └── Synchronization Hub & Forms Management               |
+─────────────────────────────────────────────────────────────+
```

## Architectural Design Principles

1. **Separation of Concerns**: The WordPress website remains completely lightweight and focused on customer traffic. The CRM handles heavy data processing, querying, and lead management.
2. **Immutable Source Records**: `source_entries` table in PostgreSQL stores the raw, unedited WPForms payload as received. CRM corrections reside in `lead_overrides`.
3. **Outbox Pattern**: Visitor form submission performance is never degraded by Render network latency. Submissions are queued in `wp_sv_stock_crm_outbox` and dispatched asynchronously.
4. **Idempotency & Replay Protection**: Each webhook carries a unique Request ID. The NestJS backend checks `sync_events` to ensure duplicate network deliveries never produce duplicate leads.
