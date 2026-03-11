# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MangoSoft CRM — a monorepo with two apps: a React SPA frontend and a Node.js/Express 5 GraphQL backend, both in TypeScript. PostgreSQL is accessed directly via the `pg` driver (no ORM).

## Commands

### Backend (`cd backend`)
- `npm start` — Start dev server with nodemon (uses `.env`)
- `npm test` — Run all Jest tests (`src/test/**/*.test.ts`)
- `npm run test:watch` — Jest in watch mode
- `npx jest src/test/users/getUserById.test.ts` — Run a single test file

### Frontend (`cd frontend`)
- `npm run dev` — Start Vite dev server
- `npm run build` — TypeScript check + Vite build
- `npm run preview` — Preview production build

## Architecture

### Backend (`backend/src/`)

Three-layer declarative GraphQL architecture. For any new entity, create exactly 3 files:

1. **Schema** (`schemas/data/<entity>.graphql`) — GraphQL SDL types, inputs, Query/Mutation extensions. Pagination returns `{ items: [Type], rows: Int }`.
2. **Resolver** (`resolvers/data/<Entity>.ts`) — Declarative mapping objects with `{ field, requestTemplate: { class, method }, type }`. NOT traditional Apollo resolvers.
3. **Service** (`services/<Entity>.ts`) — Business logic class extending `ServiceBase`. Must be registered in `services/index.ts`.

Key directories:
- `core/` — Database singleton (`database.ts`), constants, security logger. Do not rewrite unless asked.
- `integrations/` — Third-party services (Google APIs, SMTP/nodemailer).
- `core/security/` — Passport.js strategies (JWT + Header API Key), authentication middleware.

Two GraphQL servers exposed:
- `/api/auth` — Public (no JWT). Resolvers in `resolvers/auth/`, schemas in `schemas/auth/`.
- `/api/data` — Private (JWT required). Resolvers in `resolvers/data/`, schemas in `schemas/data/`. JWT injects `identity` with `id` and `account_id`.
- `GET /api` — Health check (REST).

### Frontend (`frontend/src/`)

- `features/` — Domain modules (`auth`, `dashboard`, `user`), each with components and API hooks.
- `components/` — Generic reusable UI components (no business logic).
- `app/` — App-level config: `router/` (React Router), `i18n/` (i18next).
- `hooks/` — Shared custom hooks.
- `styles/` — Global SCSS: `_variables.scss`, `_mixins.scss`.
- `routes/` — Page-level route components.

## Critical Conventions

### Backend Services
- Every service method signature: `(args: any, identity: any, context?: any, selectionSetList?: string[])`
- `identity` is the decoded JWT: `identity.id` (user), `identity.accountId` (tenant).
- **Multi-tenant isolation**: ALL SQL queries must filter by `account_id = $N` using `identity.accountId`.
- **Soft delete**: Filter reads with `deleted = 0`. Delete via `UPDATE deleted = 1`. Track `created_by`, `updated_by`, `deleted_by`.
- Use `this.getFieldsValues(selectionSetList)` for dynamic field mapping (camelCase → snake_case via `this.cols`).
- DB methods: `this.db.query()` (general), `this.db.getFirst()` (single row), `this.db.getArray()` (list), `this.db.execute()` (fire-and-forget).
- Errors: throw `GraphQLError` with extensions. Never expose raw PostgreSQL errors.
- Every service method must have a JSDoc block and `console.log(this.key, this.route, "methodName", args)` at start.
- Nested entity resolution: instantiate `new OtherService(this.db)` to share DB context. Check `selectionSetList` for nested fields. Resolve in bulk for lists to avoid N+1.

### Backend Tests
- Tests go in `src/test/<entity>/<methodName>.test.ts` (one file per method).
- Always inject a mock DB object into the service constructor — never use a real database.
- Mock pattern: `mockDb = { query: jest.fn(), getFirst: jest.fn(), execute: jest.fn() }` then `new Service(mockDb)`.

### Frontend
- **Remote state**: TanStack Query hooks in `features/[name]/api/`. Never store API data in Zustand/global state.
- **Client state**: Zustand or React Context, only for UI-only state (sidebar open, theme).
- **Styling**: Ant Design components + Bootstrap grid/utilities + SCSS modules. No inline styles, no Tailwind.
- **Inter-feature imports**: Always go through `features/[name]/index.ts` public API.
- SCSS variables in `src/styles/_variables.scss`, mixins in `src/styles/_mixins.scss`.

### Naming
- Files/Folders: camelCase or PascalCase for classes. GraphQL schemas: lowercase `.graphql`.
- Variables/functions: camelCase. Constants: UPPER_SNAKE_CASE. Classes: PascalCase named exports.
- PostgreSQL: double-quote schema names (e.g., `"security".users`). Cast dynamic arrays (`$1::int[]`).
