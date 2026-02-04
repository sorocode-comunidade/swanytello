# Channels

This folder holds **communication channel implementations** for WhatsApp and Discord. Each channel is responsible for receiving and sending messages on its platform; business logic (e.g. RAG, persistence) lives in `src/api` and `src/bot`.

## Subfolders

- **[whatsapp](whatsapp/README.md)** – WhatsApp client, webhooks, and message handlers.
- **[discord](discord/README.md)** – Discord bot (e.g. discord.js), events, and optional slash commands.
- **shared/** – (Optional) Common types or utilities (e.g. normalized message format, user id mapping). Add when needed.

## Conventions

- Put **client/session setup** and **config** (env vars, tokens) in each channel’s folder.
- Put **handlers** (incoming messages/events) and **webhooks** (WhatsApp) in the same channel folder.
- Channels can call the **REST API** (`src/api`) or use **RAG** in `src/bot` instead of duplicating logic.
- Use `src/log` for logging where useful.

## Links

- [WhatsApp](whatsapp/README.md)
- [Discord](discord/README.md)
