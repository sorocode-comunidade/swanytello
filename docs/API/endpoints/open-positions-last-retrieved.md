# GET /api/open-positions/last-retrieved

**Method:** `GET`  
**Path:** `/api/open-positions/last-retrieved`  
**Auth:** None (public)

---

## Description

Returns the **last batch of open positions** retrieved by the ETL process (LinkedIn scrape). The ETL runs on startup and every 12 hours; after each run, the extracted/transformed positions and run metadata are stored in memory. This endpoint exposes that snapshot so you can inspect what was last scraped without querying the database.

---

## Use cases

- **Inspect last ETL run** – See which positions were retrieved, and how many were created vs skipped.
- **Debug ETL** – Verify the transform phase output before or after load.
- **Feed WhatsApp** – The same data is used by `POST /api/whatsapp/send-open-positions` to send positions to WhatsApp.

---

## Request

| Item | Value |
|------|--------|
| Method | `GET` |
| Path | `/api/open-positions/last-retrieved` |
| Headers | None required |

No query, body, or path parameters.

---

## Response cases

### 200 OK

Body:

```json
{
  "retrievedAt": "2025-02-13T14:30:00.000Z",
  "extracted": 25,
  "transformed": 25,
  "created": 3,
  "skipped": 22,
  "positions": [
    {
      "title": "Desenvolvedor Full Stack",
      "link": "https://www.linkedin.com/jobs/...",
      "companyName": "Acme Corp",
      "region": "Sorocaba, São Paulo, Brasil"
    }
  ]
}
```

| Field | Type | Description |
|--------|------|-------------|
| `retrievedAt` | string | ISO 8601 timestamp of the ETL run. |
| `extracted` | number | Count of jobs from the LinkedIn scrape. |
| `transformed` | number | Count after transform (valid records). |
| `created` | number | New rows inserted into the database. |
| `skipped` | number | Records skipped (already existed by link). |
| `positions` | array | Transformed open positions (title, link, companyName, region). |

### 404 Not Found

Returned when no ETL run has completed yet (e.g. server just started and ETL has not run).

Body:

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "No ETL run has completed yet. Last retrieved open positions are not available."
}
```

---

## Examples

```bash
curl -s http://localhost:3000/api/open-positions/last-retrieved
```
