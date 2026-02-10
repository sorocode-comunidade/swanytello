# Architecture (guardrails)

Where code lives and how the main areas interact.

## Layout

- **`src/api/`** – REST API (Fastify). Entry point for external systems and frontends. Used by channels and RAG when they need to persist or query data.
- **`src/rag/`** – RAG logic (LangChain). User-facing communication goes through channels; channels call into RAG when a message needs a RAG response.
- **`src/channels/`** – Communication implementations (WhatsApp, Discord). Receive and send messages; delegate business logic to the API or RAG.
- **`src/etl/`** – Extract, Transform, Load operations. Contains `extract/` for data extraction (web scrapers, API calls), `transform/` for data transformation and cleaning, and `load/` for data publishing (database storage, API delivery, indexing). Output is consumed by RAG; ETL operations do not call the API or channels.
- **`src/db_operations/`** – Database operations and models. Contains `models/` for Prisma model operations and `prismaInstance.ts` for Prisma client. This is the only place for database access.
- **`src/log/`** – Logging utilities. Can be used by api, rag, channels, etl, db_operations.
- **`src/types/`** – Shared TypeScript types and declarations.
- **`src/utils/`** – Shared utilities (e.g. sanitizers). No API/DB/channel dependencies.
- **`tests/`** – Test suite (Vitest). Contains `helpers/` (testDb, buildTestApp for API tests), `api/` for API endpoint tests (e.g. RAG), and `db_operations/` for model tests.

## Boundaries

- **Channels** must not contain business or RAG logic; they call `src/api` or `src/rag`.
- **RAG** must not implement HTTP routes or channel protocols; it exposes logic that channels (or the API) call.
- **RAG** must not access `src/db_operations` directly; it must go through the API for database operations.
- **API** must not implement channel-specific logic (e.g. Discord events); channel code lives in `src/channels`.
- **ETL** operations must not call the API or channels; they produce data for the RAG pipeline.
- **Database Operations** (`src/db_operations`) is the only place for Prisma models and database access. API and ETL can access it; RAG and Channels cannot.
- **Guardrails** at project root (`guardrails/`) are for AI dev agents only. Runtime guardrails (e.g. RAG input/output) live elsewhere (e.g. under `src/` when added).

## Entry point

- **`src/server.ts`** – Registers API routes and starts the Fastify server. Channel or RAG startup can be wired here when implemented.

## Data flow

- External users → channels → (API and/or RAG) → channels → users.
- ETL → data for RAG.
- Frontends / external systems → API only.
