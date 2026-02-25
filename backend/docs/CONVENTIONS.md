# Backend Code Conventions (AI Guidelines)

If you are an Artificial Intelligence model generating code, follow these code conventions to keep the codebase maintainable and predictable during your execution.

## 📁 Folder Structure & Mapped Architecture
The `src/` directory is strictly divided by responsibilities. You must respect them when creating or modifying code:

- `core/`: Core utilities like the Database Singleton (`database.ts`), global constants (`constants.ts`), and security Logger (`logger.ts`). **DO NOT offer to rewrite this layer unless explicitly requested by the human.**
- `integrations/`: Third-party service integrations (e.g., Google APIs, SMTP).
- `schemas/`: Entities and GraphQL type definitions (`.graphql`).
  - **Key Location:** New schemas belong in `src/schemas/data/`.
- `resolvers/`: Declarative Resolver mappings. DO NOT use traditional Apollo constructors. **Use declarative exports of `requestTemplate`.**
  - **Key Location:** New mappings belong in `src/resolvers/data/`.
- `services/`: Business Logic and pure SQL abstraction. ALWAYS extend from `ServiceBase`.
  - **Key Location:** New services belong in `src/services/`.
- `test/`: Unit tests in Jest. **MUST be separated per method file and use Injection of Database Mocks.**

## ✍🏻 Naming & Documentation Conventions
- **Files/Folders**: Use `camelCase` or `PascalCase` when exporting classes.
- **GraphQL Schemas**: Lowercase `.graphql` extensions (e.g., `user.graphql`).
- **Variables & Functions**: `camelCase`.
- **Base Classes/Services**: `PascalCase` (e.g., `Database`, `User`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `SECRET_REFRESH`).
- **JSDoc Formatting**: EVERY method in the service layer must have a JSDoc block (`/** ... */`) documenting its purpose, `@param`s, and `@returns`. Do not skip this; it's a critical AI guideline rule for maintainability.

## 🛑 Error Handling
**NEVER** send explicit native PostgreSQL errors to the client. Throw `GraphQLError` inside your services when a request is invalid or unauthorized so that the server processes it cleanly.

```typescript
throw new GraphQLError("userNotFound", { 
    extensions: { code: 'userNotFound', message: 'The requested user was not found' } 
});
```
