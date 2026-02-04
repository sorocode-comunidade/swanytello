# REST API

This folder is the **REST API** of the monolith, built with Fastify. It is the entry point for external systems, frontends, and for other parts of the project (channels, bot) when they need to persist or query data.

## Structure

- **routes/** – HTTP route definitions and registration (public and protected).
- **controllers/** – Thin request handlers; delegate to services.
- **services/** – Business logic, validation (Zod), logging.
- **models/** – Data access (Prisma).
- **schemas/** – Zod validation schemas.
- **middleware/** – Auth (JWT), conditional auth, role-based access.
- **plugins/** – Fastify plugins (e.g. Prisma client instance).
- **fastifyInstance.ts** – Fastify app configuration (JWT, etc.).

Other systems (e.g. WhatsApp/Discord in `src/channels`, RAG in `src/bot`) can call this API over HTTP or use internal modules when appropriate.
