-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'CONVERTED', 'NOT_INTERESTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SyncJobType" AS ENUM ('HISTORICAL_IMPORT', 'INCREMENTAL_SYNC', 'RETRY_FAILED');

-- CreateEnum
CREATE TYPE "SyncJobStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('IMPORTED', 'STATUS_CHANGED', 'NOTE_ADDED', 'LEAD_UPDATED', 'FOLLOWUP_SCHEDULED', 'OVERRIDE_APPLIED', 'ARCHIVED', 'RESTORED');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wordpress_sites" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "webhookSecret" TEXT NOT NULL,
    "pullSecret" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wordpress_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wordpress_forms" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "wpFormId" TEXT NOT NULL,
    "formName" TEXT NOT NULL,
    "formCategory" TEXT,
    "isSyncActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wordpress_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_entries" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "wpFormId" TEXT NOT NULL,
    "wpEntryId" TEXT NOT NULL,
    "formName" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "sourceStatus" TEXT NOT NULL DEFAULT 'active',
    "originalFields" JSONB NOT NULL,
    "normalizedFields" JSONB NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_management" (
    "id" TEXT NOT NULL,
    "sourceEntryId" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "nextFollowupAt" TIMESTAMP(3),
    "lastContactedAt" TIMESTAMP(3),
    "assignedAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_management_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_overrides" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "originalValue" TEXT,
    "correctedValue" TEXT NOT NULL,
    "updatedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_notes" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_activities" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "performedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_jobs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "jobType" "SyncJobType" NOT NULL DEFAULT 'HISTORICAL_IMPORT',
    "status" "SyncJobStatus" NOT NULL DEFAULT 'PENDING',
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "processedRecords" INTEGER NOT NULL DEFAULT 0,
    "failedRecords" INTEGER NOT NULL DEFAULT 0,
    "cursor" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_events" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'wpforms_submission',
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_tokenHash_key" ON "admin_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "admin_sessions_adminId_idx" ON "admin_sessions"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "wordpress_sites_identifier_key" ON "wordpress_sites"("identifier");

-- CreateIndex
CREATE INDEX "wordpress_forms_siteId_idx" ON "wordpress_forms"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "wordpress_forms_siteId_wpFormId_key" ON "wordpress_forms"("siteId", "wpFormId");

-- CreateIndex
CREATE INDEX "source_entries_siteId_wpFormId_idx" ON "source_entries"("siteId", "wpFormId");

-- CreateIndex
CREATE INDEX "source_entries_submittedAt_idx" ON "source_entries"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "source_entries_siteId_wpFormId_wpEntryId_key" ON "source_entries"("siteId", "wpFormId", "wpEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "lead_management_sourceEntryId_key" ON "lead_management"("sourceEntryId");

-- CreateIndex
CREATE INDEX "lead_management_status_idx" ON "lead_management"("status");

-- CreateIndex
CREATE INDEX "lead_management_isArchived_idx" ON "lead_management"("isArchived");

-- CreateIndex
CREATE INDEX "lead_management_nextFollowupAt_idx" ON "lead_management"("nextFollowupAt");

-- CreateIndex
CREATE INDEX "lead_management_createdAt_idx" ON "lead_management"("createdAt");

-- CreateIndex
CREATE INDEX "lead_overrides_leadId_idx" ON "lead_overrides"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "lead_overrides_leadId_fieldKey_key" ON "lead_overrides"("leadId", "fieldKey");

-- CreateIndex
CREATE INDEX "lead_notes_leadId_idx" ON "lead_notes"("leadId");

-- CreateIndex
CREATE INDEX "lead_activities_leadId_idx" ON "lead_activities"("leadId");

-- CreateIndex
CREATE INDEX "lead_activities_action_idx" ON "lead_activities"("action");

-- CreateIndex
CREATE INDEX "lead_activities_createdAt_idx" ON "lead_activities"("createdAt");

-- CreateIndex
CREATE INDEX "sync_jobs_siteId_status_idx" ON "sync_jobs"("siteId", "status");

-- CreateIndex
CREATE INDEX "sync_jobs_jobType_idx" ON "sync_jobs"("jobType");

-- CreateIndex
CREATE INDEX "sync_events_siteId_status_idx" ON "sync_events"("siteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sync_events_siteId_eventId_key" ON "sync_events"("siteId", "eventId");

-- CreateIndex
CREATE INDEX "audit_logs_adminId_idx" ON "audit_logs"("adminId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wordpress_forms" ADD CONSTRAINT "wordpress_forms_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "wordpress_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_entries" ADD CONSTRAINT "source_entries_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "wordpress_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_management" ADD CONSTRAINT "lead_management_sourceEntryId_fkey" FOREIGN KEY ("sourceEntryId") REFERENCES "source_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_overrides" ADD CONSTRAINT "lead_overrides_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead_management"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_overrides" ADD CONSTRAINT "lead_overrides_updatedByAdminId_fkey" FOREIGN KEY ("updatedByAdminId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead_management"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead_management"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_performedByAdminId_fkey" FOREIGN KEY ("performedByAdminId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_jobs" ADD CONSTRAINT "sync_jobs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "wordpress_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_events" ADD CONSTRAINT "sync_events_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "wordpress_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
