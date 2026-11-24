# Render Deployment Guide

Step-by-step instructions for deploying SV Stock Research CRM to Render cloud.

## Step 1: Create a Render Account
Log in to [Render Dashboard](https://dashboard.render.com).

## Step 2: Deploy using Blueprint (`render.yaml`)
1. In the Render Dashboard, click **New +** -> **Blueprint**.
2. Connect your Git repository (`SV Stock Research Admin`).
3. Render will parse `deployment/render.yaml` and discover:
   - Database: `sv-stock-crm-db` (PostgreSQL 16)
   - Backend Service: `sv-stock-crm-api` (NestJS)
   - Frontend Service: `sv-stock-crm-admin` (Next.js)

## Step 3: Configure Shared Secrets
In the Render Environment variables settings for `sv-stock-crm-api`, configure:
- `WP_WEBHOOK_SECRET`: A secure 64-character hex string.
- `WP_PULL_SECRET`: A second secure 64-character hex string.

## Step 4: Configure WordPress Plugin
In WordPress Admin (`svstockresearch.in/wp-admin`):
1. Upload and activate `wordpress-plugin/sv-stock-crm-bridge`.
2. Go to **Settings** -> **SV Stock CRM**.
3. Set **Render Backend API URL** to `https://sv-stock-crm-api.onrender.com`.
4. Enter the matching `WP_WEBHOOK_SECRET` and `WP_PULL_SECRET`.
5. Save settings and click **Dispatch Outbox Now** to test connectivity.
