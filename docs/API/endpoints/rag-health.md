# GET /api/rag/health

**Method:** `GET`  
**Path:** `/api/rag/health`  
**Auth:** None (public)

---

## Description

Checks that the configured RAG/LLM provider (Ollama Cloud or OpenAI) is reachable and valid. Use this before calling POST `/api/rag/test` or POST `/api/rag/chat` so you know the RAG pipeline is ready.

- **Ollama Cloud** (default): Requests `OLLAMA_CLOUD_HOST/api/tags` with optional `OLLAMA_API_KEY` to verify the cloud API is up.
- **OpenAI**: Verifies `OPENAI_API_KEY` is set and calls the OpenAI API to validate the key.

Provider is chosen the same way as for chat: `RAG_LLM_PROVIDER` if set, else OpenAI if `OPENAI_API_KEY` is set, else **Ollama Cloud** (default).

---

## Use cases

- **Startup / ops** – Confirm RAG is working before sending chat requests.
- **Monitoring** – Use as a readiness probe for the RAG service.
- **Debugging** – See which provider is configured and why it might be failing (e.g. key not set, Ollama Cloud unreachable).

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

**Ollama Cloud** (default):
```json
{
  "status": "ok",
  "provider": "ollama-cloud",
  "timestamp": "2025-02-11T12:00:00.000Z"
}
```

| Field | Type | Description |
|--------|------|-------------|
| `status` | string | `"ok"` when the configured provider is reachable. |
| `provider` | string | `"openai"` or `"ollama-cloud"` (default). |
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

**Ollama Cloud** (example):
```json
{
  "statusCode": 503,
  "status": "unavailable",
  "provider": "ollama-cloud",
  "message": "Ollama Cloud unreachable at … Check OLLAMA_CLOUD_HOST and OLLAMA_API_KEY.",
  "timestamp": "2025-02-11T12:00:00.000Z"
}
```

Other possible messages:

- *"OpenAI API key is invalid or expired. Check OPENAI_API_KEY in .env and your account."*
- *"Ollama Cloud unreachable at … Check OLLAMA_CLOUD_HOST and OLLAMA_API_KEY."* (when using default provider)

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
