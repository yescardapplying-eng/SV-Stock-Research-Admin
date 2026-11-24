# Neon PostgreSQL Integration & Setup Guide

This guide details how to create and connect a free, serverless **Neon PostgreSQL** database with the SV Stock Research CRM using Prisma ORM 6.19.

---

## Why Neon with Prisma?

Neon is a serverless PostgreSQL platform built for cloud scalability. It offers:
1. **Connection Pooling (PgBouncer)**: Keeps connections fast and prevents connection exhaustion during bursts of form submissions.
2. **Direct Connection**: Allows transactional DDL migrations without PgBouncer lock limitations.

---

## Step 1: Create a Neon PostgreSQL Project

1. Go to [https://neon.tech](https://neon.tech) and log in (or create a free account).
2. Click **Create Project**.
3. Choose project settings:
   - **Project Name**: `sv-stock-crm` (or any preferred name)
   - **Postgres Version**: `16` (or `17`)
   - **Region**: Choose the region closest to your users / hosting (e.g., `Asia Pacific (Singapore)` or `ap-southeast-1`).
4. Click **Create Project**.

---

## Step 2: Obtain Connection Strings from Neon Dashboard

On your project dashboard in the **Connection Details** widget:

### A. Pooled Connection (`DATABASE_URL`)
1. Ensure the checkbox **Pooled connection** is **CHECKED**.
2. Select **Prisma** or **Node.js** format.
3. The connection string will look like:
   ```text
   postgresql://[user]:[password]@ep-[project]-pooler.[region].aws.neon.tech/[dbname]?sslmode=require
   ```
   *(Notice the `-pooler` in the host).*

### B. Direct Connection (`DIRECT_URL`)
1. **UNCHECK** the **Pooled connection** checkbox.
2. The connection string will look like:
   ```text
   postgresql://[user]:[password]@ep-[project].[region].aws.neon.tech/[dbname]?sslmode=require
   ```
   *(Notice there is NO `-pooler` in the host).*

---

## Step 3: Configure `apps/api/.env`

Create a file named `.env` in `d:\SV Stock Research Admin\apps\api\.env` (copied from `apps/api/.env.example`):

```env
# Application Runtime
NODE_ENV=development
PORT=4000
API_BASE_URL=http://localhost:4000
ADMIN_APP_ORIGIN=http://localhost:3000

# Neon PostgreSQL Database Connections
DATABASE_URL="postgresql://[user]:[password]@ep-[project]-pooler.[region].aws.neon.tech/[dbname]?sslmode=require"
DIRECT_URL="postgresql://[user]:[password]@ep-[project].[region].aws.neon.tech/[dbname]?sslmode=require"

# Security & Authentication Secrets (Generate secure random values)
AUTH_SECRET=9f83b271d44c4b699a77ef79883652db237190e29b12d5e7ef8d19a27cf90231
SESSION_SECRET=e7b4c919a7ef2049bf3876cd55120aefb762512901928374a819b782910a3912
JWT_EXPIRES_IN=8h

# WordPress Integration Credentials & Secrets
WP_SITE_URL=https://svstockresearch.in
WP_SITE_IDENTIFIER=sv-stock-research-main
WP_WEBHOOK_SECRET=sv_stock_crm_webhook_dev_secret_replace_later
WP_PULL_SECRET=sv_stock_crm_pull_dev_secret_replace_later
LOG_LEVEL=info
```

---

## Step 4: Verification (When Ready)

Once you have created and pasted your Neon connection strings into `apps/api/.env`:

1. Prisma will use `DIRECT_URL` to create the initial tables (`AdminUser`, `SourceEntry`, `LeadManagement`, `WordPressForm`, etc.) safely without transaction lock issues.
2. The running NestJS backend will automatically pick up `DATABASE_URL` and connect to the Neon database pool.
