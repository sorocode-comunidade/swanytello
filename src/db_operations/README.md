# Database Operations

This folder holds **all database operations and models** for the Swanytello monolith. This is the centralized database access layer that provides a clean interface for database operations.

## Purpose

- **Centralized database access**: All Prisma models and database operations live here.
- **Module structure**: Provides a clean module interface for other parts of the application (API, ETL, etc.).
- **Isolation**: Prevents direct database access from certain modules (e.g. RAG) for security and architectural boundaries.

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

- **API** (`src/api/`) – Can access `db_operations` directly.
- **ETL** (`src/etl/`) – Can access `db_operations` for loading data.
- **RAG** (`src/rag/`) – **Cannot** access `db_operations` directly. Must go through API.
- **Channels** (`src/channels/`) – **Cannot** access `db_operations` directly. Must go through API.

This ensures proper architectural boundaries and prevents RAG agents from directly accessing the database.
