# GraphQL Architecture & AI Guidelines

This is the definitive and mandatory architecture guide. **If you are an Artificial Intelligence agent tasked with creating a new Module or Entity**, your execution plan must strictly adhere to the following 3 decoupled components.

For any new Entity (e.g., `Product`), you must create the following 3 files in this order:

## 1. Schema Definition (`src/schemas/data/<entity>.graphql`)
Define the structure in pure GraphQL. Use GraphQL SDL.
- Define the main Type (`type Product`).
- Define the Inputs (`input CreateProductInput`).
- Extend `Query` for read methods. For pagination lists (e.g. `searchProducts`), always return a wrapped object containing `items` mapping to your array, and `rows` mapping to the total count (e.g. `type ProductsResult { items: [Product], rows: Int }`).
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
1. **Inheritance & Export**: You must use a **named export** `export class EntityName extends ServiceBase { ... }`. Do **NOT** use `export default`.
2. **Registration in Index**: Once the Service class is created, you **MUST** export it in `src/services/index.ts` (e.g., `export { Product } from './Product'`). If you forget this, the declarative resolvers will fail to inject the class!
3. **Constructor & Cols Mapping**:
   ```typescript
   constructor(db?: any) {
       super(db); // Fundamental for injecting mocks in Testing
       this.key = 'PRODUCT';
       this.route = 'services/Product';
       
       // cols defines the mapping from GraphQL camelCase fields to Postgres columns or RAW SQL Subqueries
       this.cols = {
           accountId: 'account_id', // Maps field to physical column
           avatarUrl: `(SELECT url FROM security.files WHERE entity = 'Product' AND entity_id = cast(id as varchar) AND deleted = 0 LIMIT 1)` // Maps to raw subquery
       };
   }
   ```
4. **Method Signatures**: Every method mapped by the resolver **ALWAYS** receives the same parameters: `(args: any, identity: any, context?: any, selectionSetList?: string[])`.
   - `args`: Contains the GraphQL body (e.g., `args.input`).
   - `identity`: Decrypted user JWT object making the request (`identity.id` and `identity.accountId`).
   - `selectionSetList`: An array with the requested GraphQL fields (camelCase).
5. **Multi-Tenant Isolation**: ALL `SELECT`, `UPDATE`, and `DELETE` SQL queries must mandatorily filter by tenant: `WHERE account_id = $n` (where `$n` represents `identity.accountId`).
6. **Soft Delete**: Always filter `SELECT` queries with `deleted = 0`. When deleting, perform an `UPDATE deleted = 1`.
7. **Auditing**: Fill `created_by`, `updated_by`, and `deleted_by` using `identity.id`.
8. **Dynamic SQL Handling**: 
    - Use `this.getFieldsValues(selectionSetList)` when grabbing dynamic mapped fields. 
    - Use `const result = await this.db.getFirst(...)` for single objects (returns object directly).
    - Use `const result = await this.db.getArray(...)` for multiple arrays (returns array of objects directly).
    - Use `const result = await this.db.query(...)` for generic logic, insertions, or metrics (must use `result.rows[0]` or similar).
9. **Mandatory Logging**: Always implement a `console.log(this.key, this.route, "methodName", args)` at the start and a `catch` block that traps and prints `console.error()`.
10. **Mandatory JSDoc Comments**: EVERY method created within a service must be preceded by a comprehensive JSDoc comment explaining its functionality, the parameters it takes (especially differentiating `args` and `identity`), and the returned value/promise.
