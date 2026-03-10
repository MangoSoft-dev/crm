# MangoSoft CRM - Qwen Context Documentation

## Project Overview

MangoSoft CRM is a monorepo with separate **backend** (Node.js/Express 5/GraphQL/PostgreSQL) and **frontend** (React 19/Vite/Ant Design) components. This is a full-stack application for customer relationship management.

## Architecture

### Backend
- Built with Node.js and Express 5
- Implements GraphQL API with PostgreSQL database
- Uses a strict 3-layer declarative architecture:
   1. **GraphQL Schema Layer** (`src/schemas/data/`)
   2. **Declarative Resolvers Layer** (`src/resolvers/data/`)  
   3. **Service Layer** (`src/services/`)
- Authentication implemented using Passport.js JWT and API keys
- Uses PostgreSQL through the "pg" library with a limited set of database methods
- Error handling follows strict GraphQL error conventions using `GraphQLError`

### Frontend
- Built with React 19 and Vite
- Uses Ant Design 6 with Bootstrap grid/utilities and SASS for styling
- Feature-based module structure with:
   - TanStack Query (React Query) for remote/server state
   - Zustand for client-only UI state management
   - React Router 7 for routing
- Internationalization support via i18next

## Project Structure

```
crm/
├── backend/                 # Node.js/Express/GraphQL API
│   ├── src/
│   │   ├── schemas/       # GraphQL Schema definitions
│   │   ├── resolvers/       # Declarative GraphQL resolvers 
│   │   ├── services/      # Business logic services
│   │   └── test/          # Jest tests
│   ├── package.json       # Backend dependencies and scripts
│   └── .env               # Environment configuration
├── frontend/               # React/Vite/ANTD Frontend
│   ├── src/
│   │   ├── features/      # Feature-based modules
│   │   ├── components/    # Reusable UI components
│   │   ├── routes/         # Application routes
│   │   └── styles/        # Global styles
│   ├── package.json       # Frontend dependencies and scripts
│   └── .env.local         # Frontend environment configuration
├── specs/                  # Specification documents
└── CLAUDE.md               # Development guidelines and documentation
```

## Setup Instructions

### Backend Setup
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

### Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:60001/api
VITE_API_KEY=<must match SECRET_API_KEY from backend .env>
```

## Running the Application

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

## Development Conventions

### Backend Architecture (3-Layer Declarative)
1. **GraphQL Schema Layer**: Define types, inputs, and Query/Mutation extensions in SDL.
2. **Declarative Resolvers**: Export plain objects with field name, request template pointing to service method, and type.
3. **Service Layer**: Extend `ServiceBase` with named exports, register in `src/services/index.ts`, and always implement multi-tenancy filtering by `account_id = identity.accountId`.

### Database Access
- Only 4 methods available: `query`, `getFirst`, `getArray`, `execute`
- Soft deletes: filter `deleted = 0`, update `deleted = 1` instead of hard delete
- Audit fields: populate `created_by`, `updated_by`, `deleted_by` from `identity.id`

### Error Handling
- Throw `GraphQLError` from services - never expose raw PostgreSQL errors

### Testing
- Tests live in `src/test/<entity>/<method>.test.ts`
- Inject mock DB objects via constructor (`new UserService(mockDb)`) - never touch real database in tests

### Frontend Architecture
- Feature-based module structure under `src/features/<feature>`
- TanStack Query for remote states (≈90% of state)
- Zustand stores for client-only UI state
- Never use Zustand to cache API responses
- Route components live in `src/routes/`
- State management documentation: `frontend/docs/STATE_MANAGEMENT.md`