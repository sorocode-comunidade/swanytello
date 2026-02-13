# POST /api/whatsapp/send-open-positions

**Method:** `POST`  
**Path:** `/api/whatsapp/send-open-positions`  
**Auth:** None (public)

---

## Description

Sends the **last retrieved open positions** (same data as `GET /api/open-positions/last-retrieved`) to a WhatsApp number or group via the Baileys client. The message is formatted as a readable list (title, company, region, link) with a short header (retrieved time, created/skipped counts).

The WhatsApp channel uses [Baileys](https://github.com/WhiskeySockets/Baileys) (socket-based WhatsApp Web API). On first use, when no session exists, the server prints a QR code in the terminal (via the **qrcode-terminal** package and Baileys’ `connection.update` event); scan it with WhatsApp to link the device. Session is stored in `WHATSAPP_AUTH_DIR` (default `auth_info_baileys/`). See [WhatsApp channel README](../../../src/channels/whatsapp/README.md) for why we use qrcode-terminal and how QR display works.

---

## Use cases

- **Notify a number** – Send the latest job list to a phone number (e.g. yourself or a group).
- **Automate after ETL** – Call this endpoint after each ETL run (e.g. from a cron or scheduler) to push positions to WhatsApp.

---

## Request

| Item | Value |
|------|--------|
| Method | `POST` |
| Path | `/api/whatsapp/send-open-positions` |
| Headers | `Content-Type: application/json` (optional body) |
| Body | Optional: `{ "to": "5511999999999" }` |

| Body field | Type | Required | Description |
|------------|------|----------|-------------|
| `to` | string | No | Target WhatsApp ID: digits only (e.g. `5511999999999`) or full JID (`5511999999999@s.whatsapp.net`). If omitted, uses env `WHATSAPP_TARGET_JID`. |

---

## Response cases

### 200 OK

Body:

```json
{
  "ok": true,
  "message": "Sent 25 positions to 5511999999999@s.whatsapp.net"
}
```

### 400 Bad Request

Returned when no target is provided and `WHATSAPP_TARGET_JID` is not set.

Body:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Missing target. Provide body.to (e.g. 5511999999999) or set WHATSAPP_TARGET_JID."
}
```

### 503 Service Unavailable

Returned when there are no open positions to send (ETL not run yet or last run had no positions), or when sending via WhatsApp fails (e.g. not connected, network error).

Body:

```json
{
  "statusCode": 503,
  "error": "Service Unavailable",
  "message": "No open positions available. Run ETL first (or wait for the next run)."
}
```

### 504 Gateway Timeout

Returned when the WhatsApp connection times out.

---

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WHATSAPP_AUTH_DIR` | Directory for Baileys auth state (creds + keys). | `auth_info_baileys` |
| `WHATSAPP_TARGET_JID` | Default target JID when `body.to` is omitted. | (empty) |
| `WHATSAPP_PRINT_QR` | Set to `false` to disable QR code in terminal. | `true` |

---

## Examples

```bash
# Send to a specific number (body.to)
curl -s -X POST http://localhost:3000/api/whatsapp/send-open-positions \
  -H "Content-Type: application/json" \
  -d '{"to": "5511999999999"}'

# Rely on WHATSAPP_TARGET_JID (no body)
curl -s -X POST http://localhost:3000/api/whatsapp/send-open-positions
```
