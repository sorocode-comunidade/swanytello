# GET /api/rag/health

**Method:** `GET`  
**Path:** `/api/rag/health`  
**Auth:** None (public)

---

## Description

Checks that the configured RAG/LLM provider (Ollama or OpenAI) is reachable and valid. Use this before calling POST `/api/rag/test` or POST `/api/rag/chat` so you know the RAG pipeline is ready.

- **Ollama**: Checks whether the Ollama Docker container (`swanytello-ollama`) is running, then requests `OLLAMA_BASE_URL/api/tags` to verify the API is up. You know in advance if Docker is running before using the API.
- **OpenAI**: Verifies `OPENAI_API_KEY` is set and calls the OpenAI API to validate the key.

Provider is chosen the same way as for chat: `RAG_LLM_PROVIDER` if set, else OpenAI if `OPENAI_API_KEY` is set, else Ollama.

---

## Use cases

- **Startup / ops** – Confirm RAG is working before sending chat requests.
- **Monitoring** – Use as a readiness probe for the RAG service.
- **Debugging** – See which provider is configured and why it might be failing (e.g. key not set, Ollama not running).

---

## Request

| Item | Value |
|------|--------|
| Method | `GET` |
| Path | `/api/rag/health` |
| Headers | None required |

---

## Response cases

### 200 OK – RAG reachable

**OpenAI**:
```json
{
  "status": "ok",
  "provider": "openai",
  "timestamp": "2025-02-11T12:00:00.000Z"
}
```

**Ollama** (includes `containerRunning` so you know the Docker container is up):
```json
{
  "status": "ok",
  "provider": "ollama",
  "containerRunning": true,
  "timestamp": "2025-02-11T12:00:00.000Z"
}
```

| Field | Type | Description |
|--------|------|-------------|
| `status` | string | `"ok"` when the configured provider is reachable. |
| `provider` | string | `"openai"` or `"ollama"`. |
| `containerRunning` | boolean | *(Ollama only)* Whether the `swanytello-ollama` Docker container is running. |
| `timestamp` | string | ISO 8601 timestamp. |

---

### 503 Service Unavailable – RAG not reachable

**OpenAI** (example):
```json
{
  "statusCode": 503,
  "status": "unavailable",
  "provider": "openai",
  "message": "OPENAI_API_KEY is not set. Add it to .env (e.g. OPENAI_API_KEY=sk-...) and ensure the app loads .env at startup.",
  "timestamp": "2025-02-11T12:00:00.000Z"
}
```

**Ollama** (includes `containerRunning` so you know if the container is down before trying the API):
```json
{
  "statusCode": 503,
  "status": "unavailable",
  "provider": "ollama",
  "containerRunning": false,
  "message": "Ollama not reachable at http://localhost:11434. Start with: npm run docker:up:ollama. Or set OPENAI_API_KEY to use OpenAI.",
  "timestamp": "2025-02-11T12:00:00.000Z"
}
```

Other possible messages:

- *"OpenAI API key is invalid or expired. Check OPENAI_API_KEY in .env and your account."*
- *"Ollama not reachable at http://localhost:11434. Start with: npm run docker:up:ollama. Or set OPENAI_API_KEY to use OpenAI."*

---

## Examples

```bash
curl -s http://localhost:3000/api/rag/health
```

---

## See also

- [POST /api/rag/test](rag-test.md) – Chat (message only).
- [POST /api/rag/chat](rag-chat.md) – Chat with optional PDF.
- [RAG module](../../rag.md) – Provider configuration and .env.
