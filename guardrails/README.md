# Guardrails (AI development agents)

This folder holds **guardrails** that guide **AI coding agents** (e.g. Cursor AI agents) when developing code in this project. They define conventions, patterns, and constraints so generated or suggested code stays consistent and safe.

## Purpose

- Guide AI agents (Cursor, Copilot, etc.) on how to write and structure code in this repo.
- Encode project conventions, architecture boundaries, and do/don’t rules.
- Keep development-time suggestions aligned with the monolith layout (api, bot, channels, scrapers, etc.).

This is **not** for runtime guardrails (e.g. RAG input/output validation). Those will live elsewhere (e.g. under `src/` when implemented).

## How to use

- Add rule files, prompts, or config that your AI agent (e.g. Cursor) can read (e.g. `.cursor/rules`, or docs in this folder).
- Refer to this folder or specific files from your agent’s instructions so it follows the same guardrails when editing the codebase.

## Rule files

| File | Purpose |
|------|---------|
| [Conventions.rules.md](Conventions.rules.md) | Naming, folder usage, layering (e.g. no business logic in controllers). |
| [architecture.rules.md](architecture.rules.md) | What lives in `src/api`, `src/bot`, `src/channels`, `src/scrapers`; how they interact. |
| [stack.rules.md](stack.rules.md) | TypeScript, Fastify, Prisma, LangChain, etc., and version expectations. |
| [do.rules.md](do.rules.md) | Patterns to follow: validation, auth, logging, structure, security. |
| [dont.rules.md](dont.rules.md) | Patterns to avoid: logic in wrong layers, secrets, bypassing auth, etc. |

Point AI agents (e.g. Cursor) at this folder or at specific `.rules.md` files so they follow these guardrails when editing the codebase.

RAG or API runtime guardrails (input/output validation, safety) will be implemented in a separate place in the project.
