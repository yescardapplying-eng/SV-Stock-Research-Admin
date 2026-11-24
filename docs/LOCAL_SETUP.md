# Local Development Setup Guide

Follow this guide to run the SV Stock Research CRM locally on Windows or macOS/Linux.

## Prerequisites

- **Node.js**: v20+ or v24+ (Node 24.11.0 verified)
- **npm**: 10+ or 11+ (npm 11.6.1 verified)
- **PostgreSQL**: Local PostgreSQL instance running on port 5432, or a hosted test PostgreSQL connection string.
- **PHP**: 8.0+ (PHP 8.3.36 verified for WordPress plugin development)

## 1. Install Dependencies

In the project root (`SV Stock Research Admin`):
```bash
npm install
```
This installs dependencies across all workspaces (`packages/shared`, `apps/api`, `apps/admin`).

## 2. Environment Configuration

Copy example environment files:
```bash
# Backend API configuration
cp apps/api/.env.example apps/api/.env

# Admin Frontend configuration
cp apps/admin/.env.example apps/admin/.env.local
```

Update `apps/api/.env` with your local PostgreSQL credentials:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sv_stock_crm?schema=public
```

## 3. Generate Prisma Client & Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

## 4. Build Shared Types

```bash
npm run build:shared
```

## 5. Start Development Servers

To run the backend API (port 4000):
```bash
npm run dev:api
```

To run the Next.js admin frontend (port 3000):
```bash
npm run dev:admin
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
