# Real Estate CRM

Monorepo for a real estate agency CRM. The current backend scope includes domain contracts, tenant-aware access rules, Zod schemas, the Prisma data model, minimal authentication and ADMIN-only user creation.

## Requirements

- Node.js 20.19+ and npm 10+
- PostgreSQL connection settings are required to run the API; no migration has been applied by this setup.

## Workspaces

- `apps/web` — React, Vite, TypeScript and Tailwind CSS frontend.
- `apps/api` — Express, authentication and user registration API.
- `packages/shared-types` — shared TypeScript contracts and permissions.
- `packages/validation` — shared Zod validation schemas.
- `packages/config` — shared TypeScript configuration package boundary.

Run `npm install`. For the API, copy `.env.example` to `.env`, set a real `DATABASE_URL` and replace `JWT_ACCESS_SECRET` with a random secret of at least 32 characters. Apply the Prisma schema to a development database before using the API; this project setup does not run migrations. Start the UI with `npm run dev:web` and the API separately with `npm run dev:api`. Use `npm run typecheck`, `npm test`, `npm run build` and `npm run prisma:validate --workspace @real-estate-crm/api` for local checks.

See `docs/ARCHITECTURE.md`, `docs/DOMAIN_MODEL.md`, `docs/BUSINESS_RULES.md`, `docs/PERMISSIONS.md`, `docs/USER_REGISTRATION.md` and `docs/DEVELOPMENT_RULES.md` before extending the project.
