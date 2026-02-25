# API Reference

This project exposes a **GraphQL API** rather than a traditional REST API. We use `@as-integrations/express5` to serve the GraphQL endpoints.

## Endpoints

### 1. Authentication Server (`/api/auth`)
Handles public mutations and queries (like login, password recovery).
- **Endpoint:** `POST /api/auth`
- **Playground:** Navigate to `http://localhost:60001/api/auth` in your browser (if GraphQL playground is enabled in development).

### 2. Data Server (`/api/data`)
Handles private operations. **Requires a valid JWT** in the `Authorization` header.
- **Endpoint:** `POST /api/data`
- **Header Example:** `Authorization: Bearer <your_jwt_token>`

## REST Fallbacks
There are a few traditional REST endpoints configured in `src/index.ts`:
- `GET /api` -> Health check (Returns "API ONLINE!!")

*(Note: The actual GraphQL queries and mutations are defined in `src/schemas/` and executed by `src/resolvers/`)*
