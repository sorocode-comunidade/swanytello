# WhatsApp channel

This folder implements **WhatsApp** communication using [Baileys](https://github.com/WhiskeySockets/Baileys) (socket-based WhatsApp Web API). It sends the last retrieved open positions to a WhatsApp number or group; business logic and data come from the ETL last-retrieved store and the API.

## Role

- **Send** – Proactive messages (e.g. open positions list) to a JID (phone number or group).
- **Session** – Baileys stores auth state in a directory; first run shows a QR code in the terminal to link WhatsApp.
- **No direct DB** – Uses `getLastRetrieved()` from the ETL store and the REST API for data; does not access `db_operations` directly.

## Files (`.whatsapp` nomenclature)

All WhatsApp-specific modules use the `.whatsapp.ts` suffix so they are easy to spot and associate with this channel:

| File | Purpose |
|------|---------|
| **config.whatsapp.ts** | Loads env: `WHATSAPP_AUTH_DIR`, `WHATSAPP_TARGET_JID`, `WHATSAPP_PRINT_QR`. |
| **client.whatsapp.ts** | Baileys socket: `useMultiFileAuthState`, connect, reconnect, `sendTextMessage(jid, text)`. |
| **sendOpenPositions.whatsapp.ts** | Reads last retrieved from ETL store, formats as text, sends via client to a JID. |

The API route that calls this channel is in `src/api/routes/whatsapp.routes.ts` (POST `/api/whatsapp/send-open-positions`).

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WHATSAPP_AUTH_DIR` | Directory where Baileys stores auth state (creds + keys). | `auth_info_baileys` |
| `WHATSAPP_TARGET_JID` | Default JID when request body does not provide `to`. | (empty) |
| `WHATSAPP_PRINT_QR` | If not `"false"`, print QR code in terminal on first connect. | `true` |

## Flow

1. **First run** – Start the server; when `POST /api/whatsapp/send-open-positions` is called (or any send), the client connects. If no session exists, a QR code is printed; scan with WhatsApp to link.
2. **Send open positions** – Client uses `getLastRetrieved()` from the ETL store, formats positions as text, and calls `sendTextMessage(jid, text)`.
3. **Reconnect** – On disconnect (except logout), the client reconnects automatically.

## Docs

- [POST /api/whatsapp/send-open-positions](../../../docs/API/endpoints/whatsapp-send-open-positions.md) – Request/response, env vars, examples.
- [Channels README](../README.md) – How channels fit in the architecture.
