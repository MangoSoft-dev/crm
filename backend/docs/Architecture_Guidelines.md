# GraphQL Architecture & Conventions

This document outlines the standard architecture for adding new entities, schemas, resolvers, and services in our GraphQL backend.

## 1. Schema Definition (`src/schemas/data/<entity>.graphql`)

Every entity should have its own decoupled `.graphql` file, defining its Type, Inputs, and extending the root `Query` and `Mutation`.

```graphql
# Example Schema Structure
type EntityName {
  id: ID!
  accountId: ID!
  # Other fields...
  status: Int!
  updatedAt: String
  updatedBy: ID
}

input CreateEntityInput {
  # Input fields
}

extend type Query {
  getEntityById(id: ID!): EntityName
  searchEntities(
    limit: Int
    offset: Int
    openSearch: String
    status: [Int]
    sortBy: SortBy # Requires common.graphql to be loaded
  ): [EntityName]
}

extend type Mutation {
  createEntity(input: CreateEntityInput!): EntityName
}
```

## 2. Declarative Resolvers (`src/resolvers/data/<Entity>.ts`)

We do **not** bind resolvers manually. Instead, we export a declarative `requestTemplate` object for each query or mutation. The internal framework will read these exports, bind them to the Schema, and inject the `identity` (current user session data).

```typescript
// Example: src/resolvers/data/EntityName.ts
export const createEntity = {
    field: 'createEntity', // Must match the GraphQL Schema Mutation/Query name
    requestTemplate: {
        class: 'EntityName',     // Must match the Service Class name
        method: 'createEntity',  // Must match the method inside the Service Class
    },
    type: 'Mutation', // or 'Query'
}

export const searchEntities = {
    field: 'searchEntities',
    requestTemplate: {
        class: 'EntityName',
        method: 'searchEntities',
    },
    type: 'Query',
}
```

## 3. Service Layer (`src/services/<Entity>.ts`)

Every entity must have a corresponding class in the `services` folder, inheriting from `ServiceBase`.

### Key Rules:
1. **Inheritance & Setup**: Extend from `ServiceBase` and set `this.key` and `this.route` in the constructor.
2. **Parameters**: Every method mapped from resolvers receives two exact arguments:
   - `args`: Contains the arguments passed from GraphQL (e.g., `args.input`, `args.id`).
   - `identity`: Represents the currently logged in user context (contains properties like `identity.id` and `identity.account_id`).
3. **Audit**: Always use `identity.id` for `created_by`, `updated_by`, and `deleted_by`.
4. **Tenant Isolation**: Always enforce `account_id = identity.account_id` in `WHERE` clauses for `SELECT` and `UPDATE` queries.
5. **Soft Delete**: Queries must exclude soft-deleted records (`deleted = 0`). Updates/Deletes should apply a soft-delete mechanism instead of dropping the row.
6. **Logging**: Utilize the custom console logger at the start of operations and in `catch` blocks. (e.g., `console.log(this.key, this.route, "methodName", args)`).

```typescript
// Example: src/services/EntityName.ts
import ServiceBase, { console } from './ServiceBase';

export default class EntityName extends ServiceBase {
    constructor() {
        super();
        this.key = "EntityName";
        this.route = "services/EntityName";
    }

    public async createEntity(args: { input: any }, identity: any) {
        console.log(this.key, this.route, "createEntity", args);
        try {
            // Execution example
            const query = `
                INSERT INTO "schema".entities (account_id, created_by, status, deleted) 
                VALUES ($1, $2, 1, 0) RETURNING *
            `;
            const result = await this.db.query(query, [identity.account_id, identity.id]);
            return result.rows[0];
        } catch (error) {
            console.error(this.key, this.route, error);
            throw error;
        }
    }
}
```
