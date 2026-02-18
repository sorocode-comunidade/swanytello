# POST /api/whatsapp/send-open-positions-last-12h

**Method:** `POST`  
**Path:** `/api/whatsapp/send-open-positions-last-12h`  
**Auth:** None (public)

---

## Description

Fetches **open positions created in the last 12 hours** from the database and sends them to a WhatsApp number or group via the Baileys client. Intended for **testing the WhatsApp implementation**: you get real data from the DB (positions inserted by the ETL in the last 12h) without depending on the in-memory “last retrieved” ETL snapshot.

The message is formatted as a readable list (title, company, region, link) with a header like “Last 12h open positions (DB)”. If WhatsApp is not linked yet, a QR code is shown in the terminal on first send. To **change the sender number**, remove the auth folder and re-scan: `rm -rf auth_info_baileys` (see [WhatsApp channel README](../../../src/channels/whatsapp/README.md)).

---

## Use cases

- **Test WhatsApp channel** – Trigger a send with DB-backed data to verify Baileys connection and formatting.
- **Manual or scheduled notification** – Send the latest positions (last 12h) to a number or group.

---

## Request

| Item | Value |
|------|--------|
| Method | `POST` |
| Path | `/api/whatsapp/send-open-positions-last-12h` |
| Headers | `Content-Type: application/json` (optional body) |
| Body | Optional: `{ "to": "5511999999999" }` |

| Body field | Type | Required | Description |
|------------|------|----------|-------------|
| `to` | string | No | Target WhatsApp ID: digits only (e.g. `5511999999999`) or full JID. If omitted, uses env `WHATSAPP_TARGET_JID`. |

---

## Response cases

### 200 OK

Body:

```json
{
  "ok": true,
  "message": "Sent 5 positions to 5511999999999@s.whatsapp.net"
}
```

### 400 Bad Request

Returned when no target is provided and `WHATSAPP_TARGET_JID` is not set.

### 503 Service Unavailable

Returned when sending via WhatsApp fails (e.g. not connected, network error), or when the DB query fails.

### 504 Gateway Timeout

Returned when the WhatsApp connection times out.

---

## Flow (high level)

1. API receives POST with optional `body.to`.
2. API calls `getOpenPositionsCreatedInLastHours(12)` (db_operations).
3. API calls WhatsApp channel `sendPositionsListToWhatsApp(jid, positions, "Last 12h open positions (DB)")`.
4. Channel formats the list and sends via Baileys `sendTextMessage(jid, text)`.

---

## Examples

```bash
# Send last 12h positions to a number
curl -s -X POST http://localhost:3000/api/whatsapp/send-open-positions-last-12h \
  -H "Content-Type: application/json" \
  -d '{"to": "5511999999999"}'

# Use WHATSAPP_TARGET_JID (no body)
curl -s -X POST http://localhost:3000/api/whatsapp/send-open-positions-last-12h
```
