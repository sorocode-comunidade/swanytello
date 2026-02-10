# Channels

This folder holds **communication channel implementations** for WhatsApp and Discord. Each channel is responsible for receiving and sending messages on its platform; business logic (e.g. RAG, persistence) lives in `src/api` and `src/rag`.

## Purpose

### Separation of Concerns

Channels are **pure communication layers** that:
- Handle platform-specific protocols (WhatsApp, Discord)
- Receive and send messages
- Delegate all business logic to API or RAG
- **Never** directly access database operations

### Access Patterns

- ✅ Channels can call **REST API** (`src/api`) for database operations
- ✅ Channels can call **RAG** (`src/rag`) for AI responses
- ❌ Channels **cannot** directly access `src/db_operations/`
- ❌ Channels **cannot** perform web scraping (ETL handles that)
- ❌ Channels **cannot** contain business logic

### Message Flow

```
User → Channel → RAG (for AI responses)
              → API (for data operations)
              → Channel → User
```

## Subfolders

- **[whatsapp](whatsapp/README.md)** – WhatsApp client, webhooks, and message handlers.
- **[discord](discord/README.md)** – Discord bot (e.g. discord.js), events, and optional slash commands.
- **shared/** – (Optional) Common types or utilities (e.g. normalized message format, user id mapping). Add when needed.

## Conventions

- Put **client/session setup** and **config** (env vars, tokens) in each channel's folder.
- Put **handlers** (incoming messages/events) and **webhooks** (WhatsApp) in the same channel folder.
- Channels can call the **REST API** (`src/api`) or use **RAG** in `src/rag` instead of duplicating logic.
- Use `src/log` for logging where useful.

## See Also

- [Architecture Documentation](../../docs/project_structure/architecture.md) – Detailed architectural explanation

## Links

- [WhatsApp](whatsapp/README.md)
- [Discord](discord/README.md)
