# Architecture (guardrails)

Where code lives and how the main areas interact.

## Layout

- **`src/api/`** – REST API (Fastify). Entry point for external systems and frontends. Used by channels and bot when they need to persist or query data.
- **`src/bot/`** – RAG and bot logic (LangChain). User-facing communication goes through channels; channels call into the bot when a message needs a RAG response.
- **`src/channels/`** – Communication implementations (WhatsApp, Discord). Receive and send messages; delegate business logic to the API or bot.
- **`src/scrapers/`** – Web scrapers that fetch online data for the RAG. Output is consumed by the bot; scrapers do not call the API or channels.
- **`src/log/`** – Logging utilities. Can be used by api, bot, channels, scrapers.
- **`src/types/`** – Shared TypeScript types and declarations.
- **`src/utils/`** – Shared utilities (e.g. sanitizers). No API/DB/channel dependencies.

## Boundaries

- **Channels** must not contain business or RAG logic; they call `src/api` or `src/bot`.
- **Bot** must not implement HTTP routes or channel protocols; it exposes logic that channels (or the API) call.
- **API** must not implement channel-specific logic (e.g. Discord events); channel code lives in `src/channels`.
- **Scrapers** must not call the API or channels; they produce data for the bot/RAG pipeline.
- **Guardrails** at project root (`guardrails/`) are for AI dev agents only. Runtime guardrails (e.g. RAG input/output) live elsewhere (e.g. under `src/` when added).

## Entry point

- **`src/server.ts`** – Registers API routes and starts the Fastify server. Channel or bot startup can be wired here when implemented.

## Data flow

- External users → channels → (API and/or bot) → channels → users.
- Scrapers → data for bot/RAG.
- Frontends / external systems → API only.
