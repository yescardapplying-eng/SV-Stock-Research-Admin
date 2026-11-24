# Deployment Guide – Render Architecture

This directory contains the Render Infrastructure as Code (IaC) configuration for SV Stock Research CRM.

## Services Architecture

1. **sv-stock-crm-db** (Render PostgreSQL Database)
   - Version: PostgreSQL 16
   - Houses all immutable source entries, CRM lead management tables, notes, overrides, and audit logs.
   - Internal connection string is securely injected into the API service.

2. **sv-stock-crm-api** (NestJS Backend Service)
   - Port: 10000 (Render default)
   - Exposes REST API and signed webhook receiver.
   - Executes Prisma database migrations.

3. **sv-stock-crm-admin** (Next.js Frontend Service)
   - Responsive, enterprise-grade admin UI for lead workflow management.

## Setup Instructions

1. Link your Git repository on Render.
2. Choose **Blueprints** and select `deployment/render.yaml`.
3. Provide secrets for `WP_WEBHOOK_SECRET` and `WP_PULL_SECRET` (matching those defined in WordPress `wp-config.php`).
4. Click **Apply** to deploy the complete full-stack environment.
