# API Endpoints

One file per endpoint (or per resource). Each document includes:

- **Description** – What the endpoint does and when to use it.
- **Use cases** – Typical scenarios (e.g. “Send a message with an attached PDF for tag extraction”).
- **Request** – Method, path, headers, body/query/path parameters.
- **Response cases** – Success (status + body) and errors (4xx/5xx + body).
- **Examples** – `curl` or equivalent.

---

## List of endpoint docs

| Endpoint | File | Summary |
|----------|------|---------|
| Health check | [health.md](health.md) | `GET /api/health` – Server liveness/readiness |
| RAG health | [rag-health.md](rag-health.md) | `GET /api/rag/health` – RAG/LLM reachability (Ollama or OpenAI) |
| RAG test | [rag-test.md](rag-test.md) | `POST /api/rag/test` – Chat with JSON message only |
| RAG chat | [rag-chat.md](rag-chat.md) | `POST /api/rag/chat` – Chat with optional PDF attachment |
| Open positions (last retrieved) | [open-positions-last-retrieved.md](open-positions-last-retrieved.md) | `GET /api/open-positions/last-retrieved` – Last ETL batch of open positions |
| WhatsApp send open positions | [whatsapp-send-open-positions.md](whatsapp-send-open-positions.md) | `POST /api/whatsapp/send-open-positions` – Send last ETL snapshot to WhatsApp (Baileys) |
| WhatsApp send last 12h (DB) | [whatsapp-send-open-positions-last-12h.md](whatsapp-send-open-positions-last-12h.md) | `POST /api/whatsapp/send-open-positions-last-12h` – Send last 12h positions from DB to WhatsApp (testing) |
| User | [user.md](user.md) | `GET/POST /api/user`, `PUT/DELETE /api/user/:id` – User CRUD |

---

When adding a new endpoint:

1. Create a new `.md` file in `docs/API/endpoints/` (e.g. `my-feature.md`).
2. Follow the same sections: Description, Use cases, Request, Response cases, Examples.
3. Add a row to this README and to the table in [../README.md](../README.md).
