# Database Operations

This folder holds **all database operations and models** for the Swanytello monolith. This is the centralized database access layer that provides a clean interface for database operations.

## Purpose

### Why Centralize Database Operations?

1. **Single Source of Truth**: All database operations are handled in one place (`src/db_operations/`), preventing multiple independent functions from doing the same thing. This eliminates code duplication and ensures consistency across the entire project.

2. **RAG Security Through Tool Functions**: 
   - RAG agents **never** directly access database functions from `db_operations`
   - Instead, RAG uses **tool functions** exposed through the API
   - These tool functions wrap database operations, so RAG only sees the **results**, not the functions themselves
   - Database functions are **not exposed** to the RAG agent's context
   - This ensures security and prevents RAG agents from executing arbitrary database queries

3. **Consistency and Maintainability**:
   - Consistent error handling across all database operations
   - Uniform logging patterns
   - Standardized data access patterns
   - Easier maintenance and updates (change once, affects everywhere)

### Key Architectural Decision

**RAG agents use tool functions, not direct database access.** This means:
- ✅ RAG calls API tool functions when it needs database operations
- ✅ Tool functions internally use `db_operations` models
- ✅ RAG only receives the **results** of database operations
- ❌ RAG **cannot** import or directly call `db_operations` functions
- ❌ Database functions are **never** exposed to RAG context

## Structure

- **`models/`** – Database model operations (Prisma queries). One file per entity (e.g. `entity.model.ts`).
- **`prismaInstance.ts`** – Prisma client instance configuration and initialization.

## Conventions

- Use Prisma models from `models/` for all database operations.
- Keep models focused on data access only; no business logic here.
- Models should be pure functions that perform database queries.
- Use `src/log` for logging database operations when needed.
- Export models through `models/index.ts` for clean imports.

## Usage

Other modules (API, ETL) can import models from this module:

```typescript
import { getEntityById, createEntity } from "../../db_operations/models/entity.model.js";
// or
import * as entityModel from "../../db_operations/models/entity.model.js";
```

## Access Control

- **API** (`src/api/`) – ✅ Can access `db_operations` directly. Services import models from here.
- **ETL** (`src/etl/`) – ✅ Can access `db_operations` for loading data (persisting scraped/transformed data).
- **RAG** (`src/rag/`) – ❌ **Cannot** access `db_operations` directly. Must use API tool functions.
- **Channels** (`src/channels/`) – ❌ **Cannot** access `db_operations` directly. Must use API.

## RAG Tool Function Pattern

When RAG needs database operations, it follows this pattern:

```
RAG Agent → API Tool Function → Service → db_operations Model → Database
                                    ↓
                              Returns result only
```

**Example**:
1. RAG agent needs to get user information
2. RAG calls API tool function `getUserById(id)`
3. Tool function internally uses `db_operations/models/user.model.js`
4. Only the **result** (user data) is returned to RAG
5. RAG never sees the database function itself

This ensures proper architectural boundaries and prevents RAG agents from directly accessing the database.

## Prerequisites

**⚠️ Database must be running**: Before using `db_operations` or starting the application, ensure PostgreSQL is running:

```bash
# Start PostgreSQL with Docker Compose
docker compose -f docker/docker-compose.yml up -d postgres

# Verify it's healthy
docker compose -f docker/docker-compose.yml ps
```

See [Docker Setup](../../docs/docker.md) for detailed instructions.

## See Also

- [Architecture Documentation](../../docs/architecture.md) – Detailed architectural explanation
- [API README](../api/README.md) – How API uses db_operations
- [Docker Setup](../../docs/docker.md) – PostgreSQL setup with Docker Compose
