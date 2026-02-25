# API Reference (AI Guidelines)

If you are an AI Model, note that this project DOES NOT expose a traditional REST server (except for a few exceptions described below in `index.ts`), but a GraphQL API with `@as-integrations/express5`.

## Main Endpoints

There are two main GraphQL servers (endpoints):

### 1. Public Server (`/api/auth`)
For operations that DO NOT require a session or JWT (e.g., Login, Password Recovery, Open Registration).
- **Function Mapping:** Look for declarations in `src/resolvers/auth/`.
- **Schemas:** Look in `src/schemas/auth/`.

### 2. Private Server (`/api/data`)
Handles business operations (e.g., CRUD for Users, Products, CRM Entities). **Requires strict session (JWT) validation** supplied in the header.
- **Function Mapping:** Look for declarations in `src/resolvers/data/`.
- **Schemas:** Look in `src/schemas/data/`.
- **Context (identity)**: The token injects the `identity` variable with `id` and `account_id` for all services going through this endpoint.

## REST Fallbacks
In `src/index.ts` there are REST exceptions:
- `GET /api` -> Health check.
