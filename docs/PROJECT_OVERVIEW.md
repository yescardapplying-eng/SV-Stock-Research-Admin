# Project Overview – SV Stock Research Admin CRM

## Executive Summary

SV Stock Research is a live financial research and advisory business running on WordPress (`https://svstockresearch.in`) hosted on Hostinger.

This application is an independent, production-ready, cloud-hosted CRM and Lead Management System hosted on Render. Its primary mandate is to synchronize WPForms submissions and empower administrators to manage, status, annotate, and follow up with leads in a high-security environment without ever altering or endangering the original WordPress data.

## Business Objectives

1. **Data Protection Guarantee**: Original WordPress WPForms entries remain strictly untouched and immutable. The CRM never executes delete or update queries on WordPress tables.
2. **Real-time Synchronous Capture**: Capture every submission from all WPForms forms immediately using an asynchronous outbox queue and signed webhooks.
3. **Historical Data Ingestion**: Systematically import historical WPForms submissions (including Simple Contact Form, Lead form sv stock, WP FORM USER CONSENT, and any future forms) via cursor-based batched extraction.
4. **Independent Lead Operations**: Provide CRM-specific lead lifecycle statuses, follow-up scheduling, internal notes, field corrections (overrides), and soft-archival.
5. **Role-Based Security**: Complete administrative authentication with password hashing, signed server-to-server HMAC-SHA256 communication, and audit logging.

## Monorepo Architecture Overview

- **`apps/api`**: NestJS enterprise backend with PostgreSQL & Prisma ORM.
- **`apps/admin`**: Next.js 15 App Router frontend with Tailwind CSS.
- **`packages/shared`**: Shared TypeScript contracts, DTOs, enums, and validation functions.
- **`wordpress-plugin/sv-stock-crm-bridge`**: Custom WordPress plugin with outbox pattern for WPForms 1.9.1.4+.
- **`deployment/`**: Render Blueprint configuration and infrastructure definitions.
- **`docs/`**: Comprehensive technical and operational documentation.
