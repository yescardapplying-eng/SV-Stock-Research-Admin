# API Documentation

The NestJS backend API is served at `http://localhost:4000/api` (local) and `https://sv-stock-crm-api.onrender.com/api` (Render).

## Authentication

- `POST /api/auth/login`: Admin credentials verification. Issues HttpOnly secure cookie and returns JWT session.
- `POST /api/auth/logout`: Clears session cookie and invalidates session.
- `GET /api/auth/me`: Retrieves current authenticated admin profile.

## Dashboard Metrics

- `GET /api/dashboard/overview`: Returns lead totals (total, new, contacted, interested, follow_up, converted, archived), form distribution, and status distribution.
- `GET /api/dashboard/submission-trends?days=30`: Daily submission counts for time-series charts.

## Leads Management

- `GET /api/leads`: Query leads with pagination (`page`, `pageSize`), filters (`status`, `wpFormId`, `archived`), and search term (`search`).
- `GET /api/leads/:id`: Fetch complete lead details including immutable source record, notes, overrides, and activity history.
- `PATCH /api/leads/:id/status`: Update lead status (`NEW`, `CONTACTED`, `INTERESTED`, etc.) and log audit trail.
- `POST /api/leads/:id/notes`: Add an internal admin note.
- `POST /api/leads/:id/archive`: Soft-archive a lead.
- `POST /api/leads/:id/restore`: Restore an archived lead.
- `POST /api/leads/:id/overrides`: Save corrected contact or profile fields.

## Webhooks

- `POST /api/webhooks/wordpress/entries`: Ingest real-time WPForms submission. Requires HMAC-SHA256 signature and timestamp headers.

## Synchronization

- `GET /api/sync/status`: Overall sync status, latest submission, active sync jobs.
- `POST /api/sync/import/start`: Trigger or resume historical import job.
