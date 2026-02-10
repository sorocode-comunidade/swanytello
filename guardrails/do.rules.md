# Do (guardrails)

Patterns and practices to follow when writing or suggesting code.

## API layer

- **Do** validate request body/query in the **service** layer with Zod; return 400 with `error.issues` when validation fails.
- **Do** keep controllers thin: call one service (or a few), return the result; no branching business logic.
- **Do** put all business logic and validation in **services**; models in `src/db_operations/models/` only perform data access.
- **Do** use `src/log` (logCreate, logUpdate, logDelete, logError) in services for meaningful operations and errors.
- **Do** return appropriate HTTP status codes: 200/201 for success, 400 validation, 401 unauthorized, 403 forbidden, 404 not found, 409 conflict.
- **Do** never return passwords or hashed passwords in API responses; strip or omit them (e.g. with a sanitizer) before sending.

## Auth and security

- **Do** use the existing auth middleware (e.g. conditionalAuth, requireRole) for protected routes; do not bypass in production.
- **Do** read JWT and auth-related config from environment variables (e.g. `JWT_SECRET`, `AUTH_STATUS`).
- **Do** hash passwords with bcrypt (e.g. rounds 10) before storing; compare with bcrypt when authenticating.

## Structure and imports

- **Do** use the existing folder layout: routes, controllers, services, schemas under `src/api`; models are in `src/db_operations/models/`; do not invent new top-level layers without aligning with the docs.
- **Do** use relative imports with `.js` extension for local modules (e.g. `from "../services/user.service.js"`).
- **Do** define shared types in `src/types/` and Zod schemas in `src/api/schemas/`; infer types from schemas where possible.

## Channels and RAG

- **Do** keep channel code in `src/channels/{whatsapp,discord}`; call API or RAG for business/RAG logic.
- **Do** keep RAG and agent logic in `src/rag`; channels consume it, they do not implement it.
- **Do** document new channel or RAG entry points and env vars in the relevant README.

## ETL and data

- **Do** respect robots.txt and rate limits when extracting data; use `src/log` for ETL runs and errors.
- **Do** design ETL output so it can be consumed by the RAG pipeline (e.g. text chunks, metadata).
- **Do** organize extractors under `src/etl/extract/`; place transformation logic in `src/etl/transform/` and loading logic in `src/etl/load/`.
- **Do** keep ETL phases separate: extract (data retrieval), transform (cleaning/formatting), load (publishing/storage).
- **Do** import database models from `src/db_operations/models/` in API services and ETL load operations.
- **Do** prevent RAG from directly accessing `src/db_operations`; RAG must use the API for database operations.

## Testing

- **Do** write tests for database operations in `tests/db_operations/` using Vitest.
- **Do** write API endpoint tests in `tests/api/` using `tests/helpers/buildTestApp.ts` when adding or changing protected routes.
- **Do** use test helpers from `tests/helpers/testDb.ts` for creating test data and cleaning up.
- **Do** clean the database in `beforeEach` and disconnect in `afterAll` to ensure test isolation.
- **Do** test both success and failure cases, including edge cases and validation errors.
- **Do** follow the existing test structure: `tests/db_operations/{model}.test.ts` for model tests; `tests/api/{area}.test.ts` for API tests.

## General

- **Do** use TypeScript strictly; avoid `any` unless necessary and then narrow or document.
- **Do** handle errors in services (log and rethrow) and in routes (map to HTTP responses); do not swallow errors silently.
- **Do** add or update READMEs under the affected area (e.g. `src/api/README.md`, `guardrails/README.md`) when adding new patterns or modules.

## db

- **Do** create a mermaid graph and show it to the user, human in the loop intereaction, to receive an approve answer before implement prisma schema EVERYTIME the user gives you a picture of a UML diagram or any other DB diagram related picture.