# Database Architecture & Usage

This document outlines how the backend interacts with the PostgreSQL database.

## Direct PostgreSQL Connection
Instead of a heavy ORM like Prisma or TypeORM, this project uses the `pg` driver directly via a custom Singleton class located at `src/core/database.ts`.

### Usage Example
```typescript
import { db } from '../core/database';

// Querying multiple rows
const users = await db.getArray('SELECT * FROM users WHERE role = $1', ['ADMIN']);

// Querying single row
const user = await db.getFirst('SELECT * FROM users WHERE id = $1', [userId]);

// Executing Inserts/Updates (returns affectedRows or insertId)
const result = await db.execute(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', 
    ['test@example.com', 'hashed']
);
```

## Connection Configuration
The pool configuration is loaded from `.env`:
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`
- `DB_MAX` (Max connections in pool)
- `DB_IDLE_TIMEOUT_MILLIS`

*(Note: Add the core entity tables (e.g., Users, Clients) here once the initial SQL schemas are finalized).*
