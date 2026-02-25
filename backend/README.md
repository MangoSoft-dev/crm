# Backend - MangoSoft CRM

This directory contains the API and core business logic for the CRM. The project is designed with a **highly declarative and modular** architecture to allow Artificial Intelligence (AI) models or new developers to understand and extend the codebase easily using short prompts.

## Core Tech Stack
- **Node.js** & **Express 5**
- **GraphQL** (`@as-integrations/express5`)
- **PostgreSQL** (Native `pg` driver with generic abstraction layer)
- **TypeScript**
- **Jest & ts-jest** (For unit testing)

## 🤖 Context for AI Models (AI Coding Context)
If you are an AI agent or model tasked with **creating a new feature, schema, or service**, you must mandatorily read the following guides in order before modifying any code:

1. **[Architecture Guidelines](docs/Architecture_Guidelines.md)**: Explains the strict step-by-step process to create a Model (`.graphql` file, `.ts` mapping Resolver file, and `.ts` `ServiceBase` class).
2. **[Testing Guidelines](docs/Testing_Guidelines.md)**: Explains how to create unit tests by injecting Database mocks without disrupting the environment.
3. **[Code Conventions](docs/CONVENTIONS.md)**: Explains naming rules and error handling.
4. **[Database Guidelines](docs/DATABASE.md)**: Explains the internal methods `query`, `getFirst`, and `execute` used to connect to Postgres.

## Environment Requirements
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure variables (PostgreSQL, JWT, SMTP, Google Auth).
3. **Development**: `npm run start` (nodemon + ts-node)
4. **Testing**: `npm test` or `npm run test:watch`
