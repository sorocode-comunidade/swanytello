# Load

This folder holds **data publishing operations** that persist and deliver transformed data. This is the **Load** phase of ETL operations.

## Purpose

- **Database Storage**: Persist processed content to the database using Prisma models (e.g. for embedding, indexing, or direct querying).
- **API Delivery**: Deliver data to external APIs or services.
- **File Output**: Write data to files (e.g. JSON, CSV, parquet) when needed.
- **Event Publishing**: Publish data to message queues or event streams.
- **Indexing**: Update search indices or vector databases for RAG consumption.

## Conventions

- Use `src/log` for logging load operations and errors.
- Use Prisma models from `src/db_operations/models/` for database operations.
- Handle errors gracefully and provide retry logic for external services.
- Ensure data is validated before loading (validation should happen in Transform phase).
- Load operations should be idempotent when possible (safe to retry).

## Suggested structure

Add when implementing:

- **persisters/** – Database persistence modules (Prisma model operations).
- **publishers/** – API delivery and event publishing modules.
- **writers/** – File output modules (JSON, CSV, etc.).
- **indexers/** – Search index and vector database update modules.
- **validators/** – Final data validation before loading (Zod schemas, structure checks).
- **types.ts** – Shared types for load operations and output formats.
- **utils/** – Shared loading utilities and helpers (retry logic, batching, etc.).

## Implemented

- **openPosition.load.ts** – `loadOpenPositions(data: CreateOpenPositionInput[])` persists records to the `open_position` table via `db_operations`. Skips records whose `link` already exists (deduplication for periodic ETL runs). Returns `{ created, skipped }`. Used by `etl/process/etl.process.ts`.

## Usage

Load operations receive transformed data from `transform/` and persist or deliver it to the appropriate destination. **RAG** in `src/rag` will consume this data from the database or indices.
