# Database Architecture (AI Guidelines)

If you are an Artificial Intelligence Model generating code, this document outlines how we interact with PostgreSQL **WITHOUT an ORM**.

## Direct PostgreSQL Connection 🐘
Instead of a heavy ORM like Prisma or TypeORM, our project bundles the `pg` driver directly via a native Singleton class injected through inheritance in `ServiceBase` (`this.db`). Therefore, you must purely interact with Prepared Statements in SQL. DO NOT invent ORM methods, use the 3 approved methods dictated below.

### Strict Interface (`this.db`)

Inside your Services layer (any class inheriting `ServiceBase`) you can access the DB simply by calling `this.db.<method>`. The framework only has 3 available methods for queries. **Familiarize yourself and use exclusively these**:

#### 1. `db.query(queryText, paramsArray)`
General use (Select Array, Inserts, or Updates returning multiple data).
```typescript
// Insert a record (WATCH OUT for Arrays and PostgreSQL Return Types)
const result = await this.db.query(
    'INSERT INTO "schema".users (email, password) VALUES ($1, $2) RETURNING id', 
    ['test@example.com', 'hash']
);

// Extracting the returned id requires accessing .rows[]
const insertedId = result.rows[0].id; // Returns an array of PG Rows.
```

#### 2. `db.getFirst(queryText, paramsArray)`
Returns either the First Row (`Object`) or empty (`null`). Excellent for individual lookups.
```typescript
// Note the difference of the resolved object. This returns the direct Row, NOT the full PG object.
const user = await this.db.getFirst(
    'SELECT * FROM "schema".users WHERE id = $1 AND deleted = 0', 
    [userId]
);

if (user) console.log(user.email);
```

#### 3. `db.execute(queryText, paramsArray)`
For CRUD Fire-and-Forget Operations (Does not return Data, returns Row Count or raw metrics).
```typescript
const result = await this.db.execute(
    'UPDATE "schema".users SET status = 1 WHERE deleted = 0 AND account_id = $1', 
    [identity.accountId]
);

// result.rowCount
```

### Critical PostgreSQL Rules
- Quote Injection: If you target a Schema other than default, wrap it in double quotes (e.g., `"security".users`).
- PostgreSQL Arrays: If you use dynamic `ANY` queries, cast it in the prepared statement: `$1::int[]` or `$1::text[]` as necessary.
