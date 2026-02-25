# Backend Code Conventions

To keep the codebase maintainable and predictable, please follow these guidelines:

## Folder Structure & Architecture
The `src/` directory is divided by technical responsibility:

- `core/`: Core utilities like the Database singleton (`database.ts`), global constants (`constants.ts`), and security configurations (`authStrategy.ts`).
- `integrations/`: Third-party service integrations (e.g., Google APIs, SMTP).
- `schemas/`: GraphQL type definitions (TypeDefs).
- `resolvers/`: GraphQL resolvers. This is the entry point for API requests.
- `services/`: Business logic. Resolvers should pass arguments to services, and services should interact with the database.

## Naming Conventions
- **Files/Folders**: Use `camelCase` or `kebab-case` consistently. (e.g., `authStrategy.ts`).
- **Resolvers/Schemas**: Group them by domain (e.g., `src/resolvers/auth/`).
- **Variables & Functions**: `camelCase`.
- **Classes**: `PascalCase` (e.g., `Database`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `PORT`).

## Error Handling
Throw `GraphQLError` inside your resolvers or services when a request is invalid or unauthorized, so the GraphQL server can format the response correctly for the client.
