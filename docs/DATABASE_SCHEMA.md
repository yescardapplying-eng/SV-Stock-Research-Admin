# Database Schema Documentation

The system uses PostgreSQL managed via Prisma ORM located in `apps/api/prisma/schema.prisma`.

## Core Entities & Relationships

### 1. SourceEntry (`source_entries`)
Represents the immutable snapshot of a WPForms submission.
- `id` (UUID): Primary key.
- `siteId` (UUID): Foreign key to `wordpress_sites`.
- `wpFormId` (String): WPForms Form ID.
- `wpEntryId` (String): WPForms Entry ID.
- `formName` (String): Title of the form at submission time.
- `submittedAt` (DateTime): Submission timestamp from WordPress.
- `originalFields` (JSONB): Raw field key-value pairs exactly as output by WPForms sanitization.
- `normalizedFields` (JSONB): Normalized attributes (fullName, phone, email, state, tradingSegment, tradingCapital).
- **Unique Constraint**: `[siteId, wpFormId, wpEntryId]` guarantees no duplicate entries.

### 2. LeadManagement (`lead_management`)
CRM-specific operational state for the lead.
- `id` (UUID): Primary key.
- `sourceEntryId` (UUID): 1-to-1 relationship with `SourceEntry`.
- `status` (Enum): `NEW`, `CONTACTED`, `INTERESTED`, `FOLLOW_UP`, `CONVERTED`, `NOT_INTERESTED`, `REJECTED`.
- `isArchived` (Boolean): Soft-archive flag. Default `false`.
- `archivedAt` (DateTime?): Timestamp of archival.
- `nextFollowupAt` (DateTime?): Scheduled follow-up date.
- `lastContactedAt` (DateTime?): Last contact date.

### 3. LeadOverride (`lead_overrides`)
Stores admin corrections to customer-submitted fields without altering the original source data.
- `leadId` (UUID): Reference to `LeadManagement`.
- `fieldKey` (String): Normalized or raw field identifier (e.g. `phone`).
- `originalValue` (String?): Value originally submitted.
- `correctedValue` (String): Verified/corrected value entered by admin.

### 4. LeadNote (`lead_notes`)
Internal communication and notes added by CRM administrators.
- `leadId` (UUID): Reference to `LeadManagement`.
- `note` (Text): The note content.
- `createdByAdminId` (UUID): Reference to `AdminUser`.

### 5. LeadActivity (`lead_activities`)
Audit trail of all actions performed on a lead (e.g. status changes, notes, archival).
- `leadId` (UUID): Reference to `LeadManagement`.
- `action` (Enum): `IMPORTED`, `STATUS_CHANGED`, `NOTE_ADDED`, `LEAD_UPDATED`, `ARCHIVED`, `RESTORED`.
- `description` (String): Human-readable activity narrative.
- `metadata` (JSONB?): Structured diff / context.
