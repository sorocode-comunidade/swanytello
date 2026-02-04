# Do (guardrails)

Patterns and practices to follow when writing or suggesting code.

## API layer

- **Do** validate request body/query in the **service** layer with Zod; return 400 with `error.issues` when validation fails.
- **Do** keep controllers thin: call one service (or a few), return the result; no branching business logic.
- **Do** put all business logic and validation in **services**; models only perform data access.
- **Do** use `src/log` (logCreate, logUpdate, logDelete, logError) in services for meaningful operations and errors.
- **Do** return appropriate HTTP status codes: 200/201 for success, 400 validation, 401 unauthorized, 403 forbidden, 404 not found, 409 conflict.
- **Do** never return passwords or hashed passwords in API responses; strip or omit them (e.g. with a sanitizer) before sending.

## Auth and security

- **Do** use the existing auth middleware (e.g. conditionalAuth, requireRole) for protected routes; do not bypass in production.
- **Do** read JWT and auth-related config from environment variables (e.g. `JWT_SECRET`, `AUTH_STATUS`).
- **Do** hash passwords with bcrypt (e.g. rounds 10) before storing; compare with bcrypt when authenticating.

## Structure and imports

- **Do** use the existing folder layout: routes, controllers, services, models, schemas under `src/api`; do not invent new top-level layers without aligning with the docs.
- **Do** use relative imports with `.js` extension for local modules (e.g. `from "../services/user.service.js"`).
- **Do** define shared types in `src/types/` and Zod schemas in `src/api/schemas/`; infer types from schemas where possible.

## Channels and bot

- **Do** keep channel code in `src/channels/{whatsapp,discord}`; call API or bot for business/RAG logic.
- **Do** keep RAG and agent logic in `src/bot`; channels consume it, they do not implement it.
- **Do** document new channel or bot entry points and env vars in the relevant README.

## Scrapers and data

- **Do** respect robots.txt and rate limits when scraping; use `src/log` for scraper runs and errors.
- **Do** design scraper output so it can be consumed by the bot/RAG pipeline (e.g. text chunks, metadata).

## General

- **Do** use TypeScript strictly; avoid `any` unless necessary and then narrow or document.
- **Do** handle errors in services (log and rethrow) and in routes (map to HTTP responses); do not swallow errors silently.
- **Do** add or update READMEs under the affected area (e.g. `src/api/README.md`, `guardrails/README.md`) when adding new patterns or modules.
