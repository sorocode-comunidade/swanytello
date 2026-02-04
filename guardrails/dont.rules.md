# Don't (guardrails)

Patterns and practices to avoid when writing or suggesting code.

## API layer

- **Don't** put business logic in **routes** or **controllers**; only in services.
- **Don't** access the database (Prisma) from routes or controllers; use models via services.
- **Don't** skip Zod validation in the service layer for user-provided input (body, query, params where applicable).
- **Don't** return raw Prisma entities that include `password` or other secrets; always sanitize or omit before sending.
- **Don't** invent new HTTP status codes or generic 500 for validation or business errors; use 400, 404, 409 etc. as appropriate.

## Auth and security

- **Don't** hardcode secrets (JWT secret, DB URL, API keys); use environment variables or a secure config pattern.
- **Don't** leave `AUTH_STATUS=off` or equivalent in production; use only for local development.
- **Don't** store plain-text passwords; always hash with bcrypt (or equivalent) before persisting.
- **Don't** expose internal errors (stack traces, DB errors) in API responses; log them and return a safe message.

## Structure and boundaries

- **Don't** add channel-specific logic (e.g. Discord events, WhatsApp webhooks) inside `src/api`; keep them in `src/channels`.
- **Don't** add HTTP route definitions or Fastify plugins inside `src/bot` or `src/channels`; the API is the only HTTP surface.
- **Don't** put RAG or LangChain pipelines in `src/channels` or `src/api`; they belong in `src/bot`.
- **Don't** let scrapers call the REST API or post to channels; they only produce data for the bot/RAG.
- **Don't** add runtime guardrails (e.g. RAG input/output validation) under `guardrails/` at project root; that folder is for AI dev-agent rules only.

## Code quality

- **Don't** use `any` without a good reason; prefer proper types or generics.
- **Don't** swallow errors (empty catch or catch that only returns); log and rethrow or map to a proper response.
- **Don't** duplicate validation or business logic across routes and services; validate once in the service layer.
- **Don't** commit `.env` or files with secrets; use `.env.example` and document required variables.

## Dependencies and tooling

- **Don't** add CommonJS-only modules if they break ESM (e.g. `"type": "module"`); prefer ESM-compatible or dynamic import where needed.
- **Don't** change the module system to CommonJS; the project uses ESM.
- **Don't** remove or bypass existing middleware (auth, role) on protected routes without explicit requirement and documentation.
