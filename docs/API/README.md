# API Documentation

This section documents the HTTP API of Swanytello: endpoints, use cases, request/response formats, and error handling.

---

## Structure

| Resource | Purpose |
|----------|---------|
| **[endpoints/](endpoints/)** | One Markdown file per endpoint (or per logical resource). Each file includes description, use cases, request format, response cases (success and errors), and examples. |

We keep one file per endpoint (or per small group of related routes) so that:
- New endpoints can be added without editing a single huge file.
- Teams can find and update documentation for a specific route quickly.
- The `endpoints/` folder scales as the API grows.

---

## Base URL and auth

- **Base URL**: All endpoints are mounted under `/api` (e.g. `http://localhost:3000/api` in development).
- **Public routes**: No `Authorization` header required (e.g. `GET /api/health`).
- **Protected routes**: Require `Authorization: Bearer <JWT>`. With `AUTH_STATUS=off` (local dev only), auth can be bypassed.

---

## Index of endpoints

See **[endpoints/README.md](endpoints/README.md)** for the full list and links to each endpoint’s documentation.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | [/api/health](endpoints/health.md) | No | Server health check |
| GET | [/api/rag/health](endpoints/rag-health.md) | No | RAG/LLM reachability (Ollama or OpenAI) |
| POST | [/api/rag/test](endpoints/rag-test.md) | Yes | RAG chat (JSON body, message only) |
| POST | [/api/rag/chat](endpoints/rag-chat.md) | Yes | RAG chat with optional PDF attachment |
| GET | [/api/open-positions/last-retrieved](endpoints/open-positions-last-retrieved.md) | No | Last ETL batch of open positions |
| POST | [/api/whatsapp/send-open-positions](endpoints/whatsapp-send-open-positions.md) | No | Send last positions to WhatsApp (Baileys) |
| GET | [/api/user](endpoints/user.md) | Yes | List users or get user by id |
| POST | [/api/user](endpoints/user.md) | Yes | Create user |
| PUT | [/api/user/:id](endpoints/user.md) | Yes | Update user |
| DELETE | [/api/user/:id](endpoints/user.md) | Yes | Delete user |

---

## See also

- [RAG module](../rag.md) – RAG flow, LLM configuration, and architecture.
- [Project structure](../project_structure/architecture.md) – Where the API fits in the system.
- [src/api/README.md](../../src/api/README.md) – API code structure and protected routes.
