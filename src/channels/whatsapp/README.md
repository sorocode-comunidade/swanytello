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
| **client.whatsapp.ts** | Baileys socket: `useMultiFileAuthState`, connect, reconnect, `sendTextMessage(jid, text)`. Listens to `connection.update` and prints QR via **qrcode-terminal** when no session exists (see below). |
| **sendOpenPositions.whatsapp.ts** | `sendOpenPositionsToWhatsApp(jid)` – last ETL snapshot; `sendPositionsListToWhatsApp(jid, positions, label)` – send any list (e.g. from DB). |

API routes in `src/api/routes/whatsapp.routes.ts`:
- **POST /api/whatsapp/send-open-positions** – Sends last retrieved (ETL snapshot) to WhatsApp.
- **POST /api/whatsapp/send-open-positions-last-12h** – Fetches last 12h positions from DB, sends to WhatsApp (for testing).

## QR code display and qrcode-terminal

Baileys deprecated the built-in `printQRInTerminal` option. We no longer pass it to the socket. Instead, the client listens to the **connection.update** event; when Baileys sends a `qr` string (first link or re-auth), we render it in the terminal using the **qrcode-terminal** package. That way you still get a scannable QR in the terminal without using the deprecated option, and without opening a browser. Set `WHATSAPP_PRINT_QR=false` in the environment to disable printing the QR (e.g. if you handle it elsewhere).

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WHATSAPP_AUTH_DIR` | Directory where Baileys stores auth state (creds + keys). | `auth_info_baileys` |
| `WHATSAPP_TARGET_JID` | Default JID when request body does not provide `to`. | (empty) |
| `WHATSAPP_PRINT_QR` | If not `"false"`, print QR in terminal via qrcode-terminal when Baileys sends a QR in `connection.update`. | `true` |
| `WHATSAPP_SEND_TIMEOUT_MS` | Max ms to wait for a send. After this the request returns 504 and the app keeps running (send may still complete in background). | `30000` (30s) |

## Changing the sender number (re-link)

To link a **different** WhatsApp number (e.g. you changed the phone that should send the messages), remove the saved session so Baileys shows a new QR code:

1. **Stop the app** (e.g. Ctrl+C).
2. **Remove the auth directory** (from the project root). Default folder is `auth_info_baileys`; if you set `WHATSAPP_AUTH_DIR` in `.env`, use that folder name instead:

   ```bash
   rm -rf auth_info_baileys
   ```

3. **Start the app** and call a WhatsApp send endpoint. A new QR code will appear in the terminal.
4. **Scan with the new phone**: WhatsApp → Linked devices → Link a device.

After that, messages are sent from the newly linked number.

## Flow

1. **First run** – When any send endpoint is called, the client connects. If no session exists, a QR code is printed; scan with WhatsApp to link.
2. **Send open positions (ETL snapshot)** – `sendOpenPositionsToWhatsApp(jid)` uses `getLastRetrieved()` from the ETL store, formats and sends.
3. **Send last 12h (DB)** – API calls `getOpenPositionsCreatedInLastHours(12)`, then `sendPositionsListToWhatsApp(jid, positions, label)` to format and send (for testing).
4. **Reconnect** – On disconnect (except logout), the client reconnects automatically.

## Docs

- [POST /api/whatsapp/send-open-positions](../../../docs/API/endpoints/whatsapp-send-open-positions.md) – Send last ETL snapshot.
- [POST /api/whatsapp/send-open-positions-last-12h](../../../docs/API/endpoints/whatsapp-send-open-positions-last-12h.md) – Send last 12h from DB (testing).
- [Channels README](../README.md) – How channels fit in the architecture.
