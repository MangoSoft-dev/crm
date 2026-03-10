# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MangoSoft CRM is a monorepo with a separate **backend** (Node.js/Express 5/GraphQL/PostgreSQL) and **frontend** (React 19/Vite/Ant Design). Both are independent packages in their respective directories.

## Initial Setup

### Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=60001
SECRET=
SECRET_REFRESH=
SECRET_API_KEY=
SECRET_FILE=
FILE_PATH=
DOMAIN_URL=

DB_TYPE=postgres
DB_MODE=POOL
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_DATABASE=
DB_PORT=5432
DB_QUERY_TIMEOUT=30000
DB_SSL=false
DB_MAX=10
DB_IDLE_TIMEOUT_MILLIS=30000

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=

LOGIN_EXPIRES_IN=1h
LOGIN_VALIDATE_IP=true
LOGIN_MAX_ATTEMPTS=3
LOGIN_VALIDATE_CHANGE_IP=false

GOOGLE_CLIENT_ID=
GOOGLE_SECRET=
```

### Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:60001/api
VITE_API_KEY=<must match SECRET_API_KEY from backend .env>
```

## Commands

### Backend (`/backend`)
```bash
npm run start        # Dev server with nodemon + ts-node + .env
npm run prod         # Production with .env.prod
npm test             # Run all Jest tests
npm run test:watch   # Run tests in watch mode
```

### Frontend (`/frontend`)
```bash
npm run dev          # Vite dev server
npm run build        # tsc + vite build
npm run preview      # Preview production build
```

> Frontend has no test runner configured yet.

## Backend Architecture

The backend uses a **strict 3-layer declarative architecture**. Read `backend/docs/Architecture_Guidelines.md` for the full mandatory guide. Summary:

### Layer 1: GraphQL Schema (`src/schemas/data/<entity>.graphql`)
- Define types, inputs, Query/Mutation extensions in SDL
- Pagination lists return `type EntityResult { items: [Entity], rows: Int }`

### Layer 2: Declarative Resolvers (`src/resolvers/data/<Entity>.ts`)
**Never** use traditional Apollo resolver functions. Export plain objects:
```typescript
export const getProductById = {
    field: 'getProductById',       // Must match schema exactly
    requestTemplate: {
        class: 'Product',          // Service class name
        method: 'getProductById',  // Method on that service
    },
    type: 'Query',                 // 'Query' or 'Mutation'
}
```

### Layer 3: Service (`src/services/<Entity>.ts`)
- Extend `ServiceBase` with a **named export** (no default exports)
- **Must** be registered in `src/services/index.ts`
- Every method receives `(args: any, identity: any, context?: any, selectionSetList?: string[])`
- Always filter by `account_id = identity.accountId` (multi-tenant)
- Soft deletes: filter `deleted = 0`, update `deleted = 1` instead of hard delete
- Audit: populate `created_by`, `updated_by`, `deleted_by` from `identity.id`
- Use `this.getFieldsValues(selectionSetList)` for dynamic field projection
- Nested entities: resolve with `new OtherService(this.db)` to share DB connection; avoid N+1 by batching foreign keys

### Database Access (no ORM, pure SQL)
Only 4 methods available via `this.db`:
- `db.query(sql, params)` → returns full PG result object (`result.rows[]`)
- `db.getFirst(sql, params)` → returns first row directly or `null`
- `db.getArray(sql, params)` → returns array of rows directly
- `db.execute(sql, params)` → fire-and-forget, returns `rowCount`

Schema names other than default must be double-quoted: `"security".users`.

### Error Handling
Throw `GraphQLError` from services — never expose raw PostgreSQL errors:
```typescript
throw new GraphQLError("userNotFound", {
    extensions: { code: 'userNotFound', message: '...' }
});
```

### Two GraphQL Endpoints
- `/api/auth` — public (login, token refresh, password recovery)
- `/api/data` — authenticated via Passport.js JWT or Header API Key

### Testing
Tests live in `src/test/<entity>/<method>.test.ts`. Inject mock DB objects via the constructor (`new UserService(mockDb)`) — never touch the real database in tests.

## Frontend Architecture

Feature-based module structure. Each feature under `src/features/<feature>/` is self-contained:
- `api/` — TanStack Query hooks (`useQuery`/`useMutation` wrappers)
- `components/` — UI components
- `hooks/` — form and business logic hooks
- `store/` — Zustand stores (client-only state)
- `types/` — TypeScript interfaces
- `locales/` — i18n translation files
- `index.ts` — public API; cross-feature imports go through this file only

### State Management
- **Remote/server state**: TanStack Query (≈90% of state)
- **Client-only UI state**: Zustand stores
- Never use Zustand to cache API responses

### Routing
- `src/app/router/ProtectedRoute.tsx` wraps authenticated routes
- Page components live in `src/routes/`

### Styling
Ant Design 6 + Bootstrap grid/utilities + SASS. Global styles in `src/styles/`. Component-level styles co-located with components.

## Key Docs

- `backend/docs/Architecture_Guidelines.md` — **mandatory** guide for new entities
- `backend/docs/CONVENTIONS.md` — naming, JSDoc, error handling rules
- `backend/docs/DATABASE.md` — DB method reference
- `backend/docs/Testing_Guidelines.md` — Jest patterns and mock injection
- `frontend/docs/STATE_MANAGEMENT.md` — TanStack Query + Zustand patterns
