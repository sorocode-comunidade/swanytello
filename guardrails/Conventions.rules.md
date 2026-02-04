# Conventions (guardrails)

Rules for naming, folder usage, and layering in the Swanytello monolith.

## Naming

- **Files**: Use lowercase with dots for layer/entity. Examples: `user.controller.ts`, `user.service.ts`, `user.routes.ts`, `user.schema.ts`, `user.model.ts`, `user.types.ts`.
- **Entities**: One concept per name; use singular for the entity (e.g. `user`, not `users`) in file names.
- **Controllers**: `{entity}.controller.ts`.
- **Models**: `{entity}.model.ts`.
- **Services**: `{entity}.service.ts`.
- **Routes**: `{entity}.routes.ts` or aggregators like `mainPublic.routes.ts`, `mainProtected.routes.ts`.
- **Schemas**: `{entity}.schema.ts` (Zod).
- **Types**: `{entity}.types.ts` or shared names like `fastify-jwt.d.ts`.

## Folders

- **API** (`src/api/`): Keep routes, controllers, services, models, schemas, middleware, plugins in their respective subfolders. Do not add business logic in routes or controllers.
- **Bot** (`src/bot/`): RAG and LangChain logic; no HTTP or channel code here.
- **Channels** (`src/channels/`): One subfolder per channel (e.g. `whatsapp/`, `discord/`). Shared channel types/utils can go in `channels/shared/` if needed.
- **Scrapers** (`src/scrapers/`): One module or subfolder per source or scraper type.
- **Log** (`src/log/`): Central logging only; no business logic.
- **Types** (`src/types/`): TypeScript types and declaration files (e.g. `.d.ts`).
- **Utils** (`src/utils/`): Pure helpers; no API, DB, or channel coupling.

## Layering (API)

- **Routes**: Handle HTTP only (params, query, body, reply). Call controllers; handle route-level errors (e.g. 400, 404, 409).
- **Controllers**: Thin pass-through; delegate to services. No business logic, no direct DB access.
- **Services**: Business logic, validation (Zod), logging, calls to models.
- **Models**: Data access only (Prisma). No business rules.

## Imports

- Use ESM with `.js` extension in relative imports for compiled output (e.g. `from "./foo.js"`).
- Prefer `src/`-relative or project-root paths only where the tooling supports it; otherwise use consistent relative paths.
