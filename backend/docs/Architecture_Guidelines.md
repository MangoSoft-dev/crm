# GraphQL Architecture & AI Guidelines

This is the definitive and mandatory architecture guide. **If you are an Artificial Intelligence agent tasked with creating a new Module or Entity**, your execution plan must strictly adhere to the following 3 decoupled components.

For any new Entity (e.g., `Product`), you must create the following 3 files in this order:

## 1. Schema Definition (`src/schemas/data/<entity>.graphql`)
Define the structure in pure GraphQL. Use GraphQL SDL.
- Define the main Type (`type Product`).
- Define the Inputs (`input CreateProductInput`).
- Extend `Query` for read methods (e.g., `getProductById`, `searchProducts` using `limit`, `offset`, and `sortBy` provided by `common.graphql`).
- Extend `Mutation` for write methods (e.g., `createProduct`, `updateProduct`, `deleteProduct`).

## 2. Declarative Resolvers (`src/resolvers/data/<Entity>.ts`)
**NEVER** build traditional manual Apollo resolvers binding to the DB.
Our architecture relies on automated parsing of declarative configurations. For every query/mutation in your schema, export a mapping object:

```typescript
// Example: src/resolvers/data/Product.ts
export const getProductById = {
    field: 'getProductById',     // The exact name in the GraphQL Schema
    requestTemplate: {
        class: 'Product',        // The Service class name (Step 3)
        method: 'getProductById',// The internal method name in the Service
    },
    type: 'Query',               // 'Query' or 'Mutation'
}
```
*Make sure to export every Mapping and verify that names match perfectly.*

## 3. Service Layer (`src/services/<Entity>.ts`)
This is where all business logic and pure SQL live. Create a class that extends `ServiceBase`.

### 🚨 Strict Service Rules (Read carefully!):
1. **Inheritance**: `import ServiceBase, { console } from './ServiceBase'; export default class Product extends ServiceBase { ... }`
2. **Constructor**:
   ```typescript
   constructor(db?: any) {
       super(db); // Fundamental for injecting mocks in Testing
       this.key = 'PRODUCT';
       this.route = 'services/Product';
   }
   ```
3. **Method Signatures**: Every method mapped by the resolver **ALWAYS** receives the same parameters: `(args: any, identity: any, context?: any, selectionSetList?: string[])`.
   - `args`: Contains the GraphQL body (e.g., `args.input`).
   - `identity`: Decrypted user JWT object making the request (`identity.id` and `identity.account_id`).
   - `selectionSetList`: An array with the requested GraphQL fields (camelCase).
4. **Multi-Tenant Isolation**: ALL `SELECT`, `UPDATE`, and `DELETE` SQL queries must mandatorily filter by tenant: `WHERE account_id = $n` (where `$n` represents `identity.account_id`).
5. **Soft Delete**: Always filter `SELECT` queries with `deleted = 0`. When deleting, perform an `UPDATE deleted = 1`.
6. **Auditing**: Fill `created_by`, `updated_by`, and `deleted_by` using `identity.id`.
7. **Dynamic SQL**: If you need to perform dynamic selects mapped from GraphQL, use `this.getFieldsValues(selectionSetList)` mapping it to Postgres snake_case.
8. **Mandatory Logging**: Always implement a `console.log(this.key, this.route, "methodName", args)` at the start and a `catch` block that traps and prints `console.error()`.
