# POST /api/rag/test

**Method:** `POST`  
**Path:** `/api/rag/test`  
**Auth:** Required (`Authorization: Bearer <JWT>`), unless `AUTH_STATUS=off` in dev.

---

## Description

Sends a text message to the RAG chat chain and returns the LLM reply. No file attachments. Use this for simple “message in, reply out” flows (e.g. testing the RAG pipeline or LLM configuration).

For sending a message **with an optional PDF** (e.g. for future tag extraction), use [POST /api/rag/chat](rag-chat.md) instead.

---

## Use cases

- **Testing RAG** – Verify that the chat chain and LLM (Ollama Cloud default, local Ollama, or OpenAI) are working.
- **Simple Q&A** – User sends a text question and receives an AI reply.
- **Integration checks** – Confirm auth and request/response shape.

---

## Request

| Item | Value |
|------|--------|
| Method | `POST` |
| Path | `/api/rag/test` |
| Content-Type | `application/json` |
| Headers | `Authorization: Bearer <JWT>` (required when auth is on) |

**Body (JSON):**

| Field | Type | Required | Constraints |
|--------|------|----------|-------------|
| `message` | string | Yes | 1–16384 characters |

---

## Response cases

### 200 OK

```json
{
  "reply": "The model's reply text here.",
  "timestamp": "2025-02-11T12:00:00.000Z"
}
```

| Field | Type | Description |
|--------|------|-------------|
| `reply` | string | Reply from the RAG chat chain (LLM output). |
| `timestamp` | string | ISO 8601 timestamp of the response. |

---

### 400 Bad Request – Validation error

Missing or invalid `message` (e.g. empty, too long, or not a string):

```json
{
  "error": "Validation error",
  "details": [
    { "path": ["message"], "message": "Required" }
  ]
}
```

---

### 401 Unauthorized

Missing or invalid `Authorization` header (when auth is enabled):

```json
{
  "error": "Unauthorized",
  "message": "Authentication required (or token invalid/expired)"
}
```

---

### 503 Service Unavailable – LLM unreachable

When the configured LLM is unreachable (e.g. Ollama Cloud/API down, local Ollama not running, OpenAI API key missing/invalid, or network error), the API returns **503** with a short, actionable message instead of a generic 500.

Example (default = Ollama Cloud):
```json
{
  "statusCode": 503,
  "error": "Service Unavailable",
  "message": "Ollama Cloud unreachable at … Check OLLAMA_CLOUD_HOST and OLLAMA_API_KEY."
}
```

Other possible messages (depending on provider and failure):

- *"OpenAI API error. Check OPENAI_API_KEY in .env and your account access."*
- *"LLM service is unreachable. Check that your configured provider (Ollama Cloud or OpenAI) is running and reachable."*

**Default LLM is Ollama Cloud**; override via `.env` by setting `OPENAI_API_KEY` (and optionally `RAG_LLM_PROVIDER=openai`) for OpenAI. See [RAG module – How to change the LLM](../../rag.md#how-to-change-the-llm).

---

## Examples

```bash
# With JWT
curl -X POST http://localhost:3000/api/rag/test \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

---

## See also

- [POST /api/rag/chat](rag-chat.md) – Same flow with optional PDF attachment.
- [RAG module](../../rag.md) – LLM configuration and request flow.
