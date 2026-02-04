# WhatsApp channel

This folder implements **WhatsApp** communication: receiving and sending messages, and optional webhooks for incoming events.

## Role

- Receive WhatsApp messages (e.g. via webhook or polling).
- Send replies or proactive messages.
- Optional: media, templates, or Business API features.

## Suggested stack

- **WhatsApp Business API (Cloud)** – Official API; use an HTTP client and webhook endpoint to receive events.
- **Baileys** – Unofficial library for a session-based connection.

Choose one based on product needs (official vs. unofficial, multi-device, etc.).

## Environment variables (examples)

- `WHATSAPP_TOKEN` – API or session token.
- `WHATSAPP_PHONE_NUMBER_ID` – Business API phone number ID (if using Cloud API).
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` – Token for webhook verification.

## Suggested internal structure

Add when implementing:

- **client/** – WhatsApp client/session setup and connection.
- **handlers/** – Logic for incoming messages (e.g. forward to RAG in `src/bot`, call `src/api`).
- **webhooks/** – HTTP route(s) for webhook verification and incoming payloads.
- **config.ts** – Load and expose env/config for this channel.

Implementation will follow once the stack (Business API vs. Baileys) is chosen.
