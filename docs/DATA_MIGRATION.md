# Historical Data Migration Guide

This document details the plan and technical procedure for importing all existing WPForms entries from `svstockresearch.in` into the Render PostgreSQL CRM.

## Initial Discovery Snapshot (November 24, 2026 Reference)

| Form Name | Initial Entries Count | Primary Segment |
| :--- | :--- | :--- |
| **Simple Contact Form** | 79 | General inquiries |
| **Lead form sv stock** | 1,438 | Active trading leads |
| **WP FORM USER CONSENT** | 259 | User compliance & consent |
| **Total Snapshot** | **1,776** | Reference only (dynamic discovery used) |

> **Important**: Counts are dynamic. The migration tool never hardcodes form IDs or record counts.

## Safe Migration Principles

1. **Read-Only**: The export endpoint executes read-only SQL queries against `wpforms_entries`. No `DELETE`, `UPDATE`, or `DROP` statements exist anywhere in the export code.
2. **Batched Cursor Pagination**: Uses `WHERE entry_id > :cursor ORDER BY entry_id ASC LIMIT 50`. Avoids large SQL `OFFSET` penalties on WordPress MySQL.
3. **Pausable and Resumable**: Each batch updates `cursor` in `sync_jobs`. If interrupted, the migration resumes exactly where it left off.
4. **Strict Duplicate Prevention**: PostgreSQL `source_entries` table enforces `UNIQUE(siteId, wpFormId, wpEntryId)`. Re-running an import is completely idempotent and safe.
5. **Dry-Run Preflight**: An optional `--dry-run` inspection verifies database connectivity and schema before importing.
