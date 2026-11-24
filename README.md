# SV Stock Research – Admin CRM & Lead Management System

Production-ready, cloud-hosted Lead CRM and WPForms Synchronization Platform for [SV Stock Research](https://svstockresearch.in).

## Monorepo Layout

```
SV Stock Research Admin/
├── apps/
│   ├── admin/                # Next.js 15 Admin Frontend (Tailwind CSS, SaaS UI)
│   └── api/                  # NestJS Backend API & Synchronization Engine
├── packages/
│   └── shared/               # Shared TypeScript types, enums, DTOs & validation
├── wordpress-plugin/
│   └── sv-stock-crm-bridge/  # Custom WordPress Plugin (WPForms 1.9.1.4 Outbox Bridge)
├── docs/                     # Technical, Architectural, and Integration Documentation
├── deployment/               # Render Blueprint (render.yaml) & IaC scripts
├── package.json              # Root npm workspaces configuration
└── tsconfig.base.json        # Base TypeScript compiler settings
```

## Quick Start (Local Development)

```bash
# 1. Install all dependencies across monorepo
npm install

# 2. Build shared contracts
npm run build:shared

# 3. Generate Prisma client
npm run prisma:generate

# 4. Start backend (port 4000)
npm run dev:api

# 5. Start frontend (port 3000)
npm run dev:admin
```

See [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) for full setup instructions.
