# POST /api/rag/chat

**Method:** `POST`  
**Path:** `/api/rag/chat`  
**Auth:** Required (`Authorization: Bearer <JWT>`), unless `AUTH_STATUS=off` in dev.

---

## Description

Sends a message to the RAG chat chain with an **optional PDF attachment**. The message is required; the PDF is optional. When a PDF is sent, it is passed through to the RAG pipeline for future use (e.g. a tag-extraction tool that will read the PDF and retrieve tags).

Use this endpoint when the client needs to:
- Ask a question and optionally attach a document (e.g. “Extract tags from this PDF”).
- Support “message + file” flows that will later use RAG tools (e.g. tag extraction from the PDF).

For message-only (no file), you can use either this endpoint or [POST /api/rag/test](rag-test.md).

---

## Use cases

- **Chat with document** – User sends a message and attaches a PDF; the system can later use tools to extract tags or other data from the PDF.
- **Tag extraction (future)** – Same request shape will drive a RAG tool that parses the PDF and returns tags.
- **Unified chat API** – One endpoint that accepts both “text only” and “text + PDF” without changing the client contract.

---

## Request

| Item | Value |
|------|--------|
| Method | `POST` |
| Path | `/api/rag/chat` |
| Content-Type | `multipart/form-data` (required) |
| Headers | `Authorization: Bearer <JWT>` (required when auth is on) |

**Form fields (multipart):**

| Field | Type | Required | Constraints |
|--------|------|----------|-------------|
| `message` | string | Yes | 1–16384 characters |
| `pdf` | file | No | Must be `application/pdf`; max size 10 MB |

- **message** – The user’s text message.
- **pdf** – Optional PDF file. If present, must be PDF MIME type and within the size limit. Filename is preserved for future tooling.

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
| `reply` | string | Reply from the RAG chat chain. |
| `timestamp` | string | ISO 8601 timestamp of the response. |

Same shape as [POST /api/rag/test](rag-test.md). When a PDF is attached, the backend may use it in future tools (e.g. tag extraction); the response format does not change.

---

### 400 Bad Request – Not multipart

Request body is not `multipart/form-data`:

```json
{
  "error": "Bad request",
  "message": "Content-Type must be multipart/form-data"
}
```

---

### 400 Bad Request – Validation (message)

Missing or invalid `message` (e.g. empty or too long):

```json
{
  "error": "Validation error",
  "details": [
    { "path": ["message"], "message": "message is required" }
  ]
}
```

---

### 400 Bad Request – Invalid PDF

File under `pdf` is not a PDF or exceeds 10 MB:

```json
{
  "error": "Validation error",
  "message": "File must be a PDF (application/pdf)"
}
```

or:

```json
{
  "error": "Validation error",
  "message": "PDF size must not exceed 10MB"
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

When the configured LLM is unreachable (e.g. Ollama not running, OpenAI API key missing/invalid, or network error), the API returns **503** with a short, actionable message instead of a generic 500:

```json
{
  "statusCode": 503,
  "error": "Service Unavailable",
  "message": "Ollama is not running. Start Ollama (e.g. on port 11434) or set RAG_LLM_PROVIDER=openai and OPENAI_API_KEY in .env to use OpenAI."
}
```

Other possible messages (depending on the failure):

- *"OpenAI API error. Check OPENAI_API_KEY in .env and your account access."*
- *"LLM service is unreachable. Check that your configured provider (Ollama or OpenAI) is running and reachable."*
- *"LLM service temporarily unavailable. Please try again or check your RAG provider configuration."*

Ensure `.env` is loaded at startup and that either Ollama is running (if using Ollama) or `OPENAI_API_KEY` is set (to use OpenAI). If only `OPENAI_API_KEY` is set and `RAG_LLM_PROVIDER` is not set, OpenAI is used automatically. See [RAG module – How to change the LLM](../../rag.md#how-to-change-the-llm).

---

## Examples

**Message only (no PDF):**

```bash
curl -X POST http://localhost:3000/api/rag/chat \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "message=What tags can you extract from my document?"
```

**Message + PDF:**

```bash
curl -X POST http://localhost:3000/api/rag/chat \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "message=Extract tags from this PDF" \
  -F "pdf=@/path/to/document.pdf"
```

---

## See also

- [POST /api/rag/test](rag-test.md) – JSON-only chat (no file).
- [RAG module](../../rag.md) – LLM configuration and flow; future tag-extraction tool will use the attached PDF.
