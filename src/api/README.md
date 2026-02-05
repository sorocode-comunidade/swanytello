# REST API

This folder is the **REST API** of the monolith, built with Fastify. It is the entry point for external systems, frontends, and for other parts of the project (channels, RAG) when they need to persist or query data.

## Structure

- **routes/** – HTTP route definitions and registration (public and protected).
- **controllers/** – Thin request handlers; delegate to services.
- **services/** – Business logic, validation (Zod), logging. Import models from `src/db_operations/models/`.
- **schemas/** – Zod validation schemas.
- **middleware/** – Auth (JWT), conditional auth, role-based access.
- **fastifyInstance.ts** – Fastify app configuration (JWT, etc.).

**Note**: Database models are in `src/db_operations/models/`, not in this folder. Services import models from there.

Other systems (e.g. WhatsApp/Discord in `src/channels`, RAG in `src/rag`) can call this API over HTTP or use internal modules when appropriate.
