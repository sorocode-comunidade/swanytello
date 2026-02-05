# REST API

This folder is the **REST API** of the monolith, built with Fastify. It is the entry point for external systems, frontends, and for other parts of the project (channels, RAG) when they need to persist or query data.

## Purpose

### Unified Interface

The API provides a unified interface for:
- External systems and frontends
- Internal modules (channels, RAG) that need database operations
- Tool functions for RAG agents

### Tool Functions for RAG

**Critical**: The API exposes **tool functions** that RAG agents can call. These functions:
- Wrap database operations from `src/db_operations/`
- Enforce authentication and authorization
- Return only results, never exposing database functions to RAG
- Provide a safe interface for RAG to access database operations

**Example**: Instead of RAG directly calling `getUserById()` from `db_operations`, RAG calls the API tool function `getUserByIdTool()`, which internally uses `db_operations` and returns only the result.

## Structure

- **routes/** – HTTP route definitions and registration (public and protected).
- **controllers/** – Thin request handlers; delegate to services.
- **services/** – Business logic, validation (Zod), logging. Import models from `src/db_operations/models/`.
- **schemas/** – Zod validation schemas.
- **middleware/** – Auth (JWT), conditional auth, role-based access.
- **fastifyInstance.ts** – Fastify app configuration (JWT, etc.).

**Note**: Database models are in `src/db_operations/models/`, not in this folder. Services import models from there.

## Access Patterns

- **Channels** → Call API endpoints or use internal modules
- **RAG** → Uses API tool functions (never direct `db_operations` access)
- **External Systems** → Call API endpoints over HTTP
- **ETL** → Can use API or directly access `db_operations` for loading data

## See Also

- [Architecture Documentation](../../docs/architecture.md) – Detailed architectural explanation
- [Database Operations](../db_operations/README.md) – How API uses db_operations
