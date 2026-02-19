# Swanytello Architecture

This document explains the architectural decisions and design patterns used in the Swanytello monolith.

---

## Overview

Swanytello is a **monolithic application** that combines multiple communication channels (WhatsApp, Discord) with RAG (Retrieval-Augmented Generation) capabilities. The architecture is designed to:

- **Centralize database operations** to prevent duplication and ensure consistency
- **Isolate RAG agents** from direct database access for security
- **Standardize data ingestion** through a single ETL pipeline
- **Maintain clear boundaries** between components

---

## Core Components

### 1. Database Operations (`src/db_operations/`)

**Purpose**: Centralized database access layer for all database operations across the project.

**Why this architecture?**

1. **Single Source of Truth**: All database operations are handled in one place, preventing multiple independent functions from doing the same thing. This eliminates code duplication and ensures consistency.

2. **RAG Security**: RAG agents **never** directly access database functions. Instead, they use **tool functions** that wrap database operations. This means:
   - RAG agents only see the **results** of database operations, not the functions themselves
   - Database functions are not exposed to the RAG agent's context
   - Security and access control are enforced at the API layer

3. **Consistency**: By centralizing all database operations, we ensure:
   - Consistent error handling
   - Uniform logging patterns
   - Standardized data access patterns
   - Easier maintenance and updates

**Access Control**:
- ✅ **API** (`src/api/`) – Can access `db_operations` directly
- ✅ **ETL** (`src/etl/`) – Can access `db_operations` for loading data
- ❌ **RAG** (`src/rag/`) – **Cannot** access `db_operations` directly. Must use API tool functions
- ❌ **Channels** (`src/channels/`) – **Cannot** access `db_operations` directly. Must use API

**Structure**:
- `models/` – CRUD operations for database entities (e.g., `open_position.model.ts`, `tag_analisys.model.ts`)
- `db_types/` – Zod schemas and TypeScript types for validation
- `prismaInstance.ts` – Prisma client instance

**Features**:
- All operations use Zod schemas for input validation
- Cold delete functionality for soft-deleting records
- Transaction support for atomic operations
- Type-safe database access with Prisma
- Array-to-JSON conversion helpers for complex data types (e.g., tag tiers)

**Available Models**:
- **OpenPosition** – Job positions with full CRUD and cold delete support
- **TagAnalisys** – Tag analysis with three tiers, each storing arrays of tag words

**See**: [Database Operations README](../../src/db_operations/README.md)

---

### 2. ETL Pipeline (`src/etl/`)

**Purpose**: Extract, Transform, and Load operations for ingesting data from the internet.

**Why this architecture?**

1. **Single Data Ingestion Path**: Web scraping is the **only way** to retrieve information from the internet in this project. All external data must go through the ETL pipeline:
   - **Extract**: Web scrapers fetch raw data from websites
   - **Transform**: Data is cleaned, standardized, and formatted
   - **Load**: Processed data is stored in the database

2. **Data Quality**: By standardizing the ETL process, we ensure:
   - Consistent data formats
   - Proper data cleaning and validation
   - Reliable data storage patterns
   - Traceable data lineage

3. **Separation of Concerns**: ETL operations are isolated from:
   - API endpoints (ETL doesn't call API)
   - Channel logic (ETL doesn't post to channels)
   - RAG processing (ETL only stores data; RAG consumes it)

**Components**:
- **`extract/`** – Web scrapers and data extraction (e.g. LinkedIn jobs via `findLinkedInJobs()`)
- **`transform/`** – Data standardization, cleaning, and formatting (e.g. `transformLinkedInJobsToOpenPositions()` → `CreateOpenPositionInput[]`)
- **`load/`** – Database storage (e.g. `loadOpenPositions()` persists to `open_position`, skipping duplicates by link)
- **`process/`** – ETL orchestration: `runLinkedInEtlProcess()` runs extract → transform → load. The app scheduler (`src/scheduler.ts`) runs ETL **on startup** and **every 6 hours**, then sends new open positions (last 6h) to WhatsApp (called from `server.ts` after listen)

**Implemented pipeline**: LinkedIn job search (extract) → transform to open_position schema → load into database. Only one ETL run at a time (guard in `etl.process.ts`).

**See**: [ETL README](../../src/etl/README.md), [Project structure (visual)](project-structure.md) (ETL and startup diagrams).

---

### 3. RAG (`src/rag/`)

**Purpose**: Retrieval-Augmented Generation logic using LangChain (tools, chains, llms). Consumed by the API and by channels when a user message needs an AI reply.

**Current implementation**:
- **LLM**: Ollama Cloud (default) or OpenAI via `src/rag/llms/` (`ollama-cloud.llm.ts`, `openai.llm.ts`). Provider is selected by `RAG_LLM_PROVIDER` or, if unset, by presence of `OPENAI_API_KEY` (then OpenAI); otherwise Ollama Cloud. Env is loaded at startup from `.env` (see [RAG documentation](../rag.md)).
- **Chain**: `src/rag/chains/chat.chain.ts` — `runChatChain(message, attachment?)` invokes the configured chat model and returns the reply text. Optional `attachment` (e.g. PDF) is reserved for future tools (e.g. tag extraction).
- **API**:
  - **GET `/api/rag/health`** (public) — Checks that the configured LLM (Ollama Cloud or OpenAI) is reachable. Implemented in `src/utils/ragPing.ts`; same check runs at startup (`displayRagStatus()`).
  - **POST `/api/rag/test`** (JWT) — JSON body `{ message }`; returns `{ reply, timestamp }`.
  - **POST `/api/rag/chat`** (JWT) — Multipart: `message` (required), `pdf` (optional). For message + PDF flows; returns `{ reply, timestamp }`.
- **Startup**: `server.ts` loads `.env` then runs `displayDatabaseStatus()` and `displayRagStatus()` before registering routes. See [Project structure (visual)](project-structure.md) for the startup sequence diagram.

**Why this architecture?**

1. **Tool-Based Database Access**: RAG agents use **tool functions** (not direct database access):
   - Tool functions are exposed through the API
   - RAG agents call these tools when they need database operations
   - Database functions themselves are never exposed to RAG context
   - Only the **results** of database operations are returned to RAG

2. **Security**: By preventing direct database access:
   - RAG agents cannot execute arbitrary database queries
   - Access control is enforced at the API layer
   - Database schema and operations remain hidden from RAG

3. **Channel Integration**: RAG receives requests from channels and returns responses, but never directly interacts with channels.

**See**: [RAG README](../../src/rag/README.md), [RAG documentation](../rag.md) (usage, changing the LLM, Mermaid flow).

---

### 4. API (`src/api/`)

**Purpose**: REST API built with Fastify. Entry point for external systems and internal modules.

**Routes**:
- **Public** (no JWT): `GET /api/health`, `GET /api/rag/health` (RAG/LLM reachability).
- **Protected** (JWT): User CRUD (`/api/user`), RAG chat (`POST /api/rag/test`, `POST /api/rag/chat`). See [API documentation](../API/README.md) for the full endpoint list.

**Why this architecture?**

1. **Unified Interface**: All database operations and business logic are exposed through a consistent REST API
2. **Access Control**: The API layer enforces authentication and authorization (except for health endpoints)
3. **Tool Functions**: Provides tool functions for RAG agents to access database operations safely
4. **Service Layer**: Business logic lives in services, which use `db_operations` for data access

**See**: [API README](../../src/api/README.md), [API endpoints](../API/README.md)

---

### 5. Channels (`src/channels/`)

**Purpose**: Communication channel implementations (WhatsApp, Discord).

**Why this architecture?**

1. **Separation**: Channel-specific logic is isolated from business logic
2. **Delegation**: Channels delegate to API or RAG for business operations
3. **No Direct DB Access**: Channels cannot access `db_operations` directly; they must use the API

**See**: [Channels README](../../src/channels/README.md)

---

## Data Flow

### User Message Flow

```
User → Channel → RAG → API (tool functions) → db_operations → Database
                ↓
            Response ← Channel ← RAG ← API ← db_operations
```

### ETL Data Flow

```
Internet → ETL Extract → ETL Transform → ETL Load → db_operations → Database
                                                          ↓
                                                    RAG consumes
```

### Database Access Flow

```
API Services → db_operations/models → Prisma → PostgreSQL
ETL Load     → db_operations/models → Prisma → PostgreSQL
RAG          → API Tool Functions → API Services → db_operations/models → Prisma → PostgreSQL
```

---

## Architectural Principles

1. **Centralization**: Database operations are centralized in `db_operations`
2. **Isolation**: RAG agents are isolated from direct database access
3. **Single Path**: ETL is the only way to ingest internet data
4. **Tool Functions**: RAG uses tool functions, not direct database access
5. **Clear Boundaries**: Each component has well-defined responsibilities and access patterns

---

---

## Testing (`tests/`)

**Purpose**: Test suite for database operations, models, and API endpoints using Vitest.

**Why this architecture?**

1. **Test Isolation**: Tests are located at the project root, separate from source code, ensuring clear separation of concerns
2. **Database Testing**: Tests verify all CRUD operations, validation, and edge cases for database models
3. **API Testing**: Endpoint tests (e.g. RAG) use `buildTestApp()` and `app.inject()`; no running server or DB required for auth/response tests
4. **Test Utilities**: Helper functions in `tests/helpers/` provide reusable test data and app building:
   - `testDb.ts` – Database utilities (clean, create test data, disconnect)
   - `buildTestApp.ts` – Fastify app with JWT and protected routes for API tests
5. **Coverage**: Comprehensive test coverage for `OpenPosition` and `TagAnalisys` models, plus API (e.g. POST `/api/rag/test` with JWT and 401 cases)
6. **Readable output**: Prisma query logging is disabled during tests (when `VITEST` is set) so the console stays clear

**Structure**:
- `helpers/testDb.ts` – Database test utilities (clean, create test data, disconnect)
- `helpers/buildTestApp.ts` – Build Fastify app for API tests (JWT + protected routes)
- `api/` – API endpoint tests (e.g. `rag.test.ts` for POST `/api/rag/test`)
- `db_operations/` – Test files for database models
- `setup.ts` – Test environment configuration

**See**: [Tests README](../../tests/README.md)

---

## See Also

- [Project Structure (Visual)](project-structure.md) – Mermaid diagrams
- [Guardrails](../../guardrails/README.md) – Development guidelines
- [Tests](../../tests/README.md) – Testing documentation
- Component-specific READMEs in each `src/` folder
