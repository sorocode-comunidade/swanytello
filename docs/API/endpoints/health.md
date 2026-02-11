# GET /api/health

**Method:** `GET`  
**Path:** `/api/health`  
**Auth:** None (public)

---

## Description

Simple health check for liveness/readiness probes (e.g. load balancers, Kubernetes). Returns a fixed structure with status and server timestamp.

---

## Use cases

- **Liveness probe** – Confirm the process is running.
- **Load balancer** – Check if the instance should receive traffic.
- **Monitoring** – Verify the API is up before running deeper checks.

---

## Request

| Item | Value |
|------|--------|
| Method | `GET` |
| Path | `/api/health` |
| Headers | None required |

No query, body, or path parameters.

---

## Response cases

### 200 OK

Body:

```json
{
  "status": "ok",
  "timestamp": "2025-02-11T12:00:00.000Z"
}
```

| Field | Type | Description |
|--------|------|-------------|
| `status` | string | Always `"ok"` when the server is healthy. |
| `timestamp` | string | ISO 8601 timestamp from the server. |

No error responses are documented for this endpoint (server errors return 5xx as usual).

---

## Examples

```bash
curl -s http://localhost:3000/api/health
```
