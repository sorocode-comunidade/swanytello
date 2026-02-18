# Production deployment

This document describes how to build and run Swanytello in a **production** environment: compile the project, run the built app, and reduce console output.

---

## Build and run

In production you should **build** the TypeScript project and run the compiled JavaScript. Do not run the dev server (`npm run dev` or `tsx`).

### 1. Install dependencies

```bash
npm ci
```

Use `npm ci` for reproducible installs (respects `package-lock.json`).

### 2. Build

```bash
npm run build
```

This runs `tsc` and compiles `src/` into `dist/`. The main entry is `dist/server.js`.

### 3. Start the server

```bash
NODE_ENV=production node dist/server.js
```

Or use the script (same effect):

```bash
npm run start:prod
```

Ensure `.env` (or your production env) is set with correct `DATABASE_URL`, `JWT_SECRET`, `PORT`, and any optional vars (RAG, WhatsApp, etc.). The app loads `.env` from the current working directory.

### One-liner (e.g. in a deploy script)

```bash
npm ci && npm run build && NODE_ENV=production node dist/server.js
```

---

## Reducing console output in production

In production you typically want less noise in the console: fewer request logs and no QR codes in the terminal.

### 1. Set `NODE_ENV=production`

With `NODE_ENV=production`:

- **Fastify** uses log level `warn` instead of `info`, so normal HTTP requests are not logged. Only warnings and errors appear.
- You can override the level with `LOG_LEVEL` (e.g. `LOG_LEVEL=error` for even less output).

### 2. WhatsApp: disable QR in terminal

If you use the WhatsApp channel, set:

```env
WHATSAPP_PRINT_QR=false
```

Then the server will not print a QR code in the terminal when linking or re-linking. Link the device once in a dev/staging environment and reuse the same auth directory in production, or use another method to capture the QR if you must re-link in production.

### 3. Optional: `LOG_LEVEL`

To make the server even quieter, set:

```env
LOG_LEVEL=error
```

Allowed values follow Pino levels: `trace`, `debug`, `info`, `warn`, `error`, `fatal`. In production, `warn` (default when `NODE_ENV=production`) or `error` is usually enough.

---

## Checklist

| Item | Notes |
|------|--------|
| Build before run | Always run `npm run build` (or `tsc`) and then `node dist/server.js`. |
| `NODE_ENV=production` | Enables quieter logging and production behavior. |
| `.env` / env vars | Set `DATABASE_URL`, `JWT_SECRET`, `PORT`; optional: RAG, WhatsApp, `AUTH_STATUS=ON`. |
| `WHATSAPP_PRINT_QR=false` | Recommended in production if using WhatsApp. |
| Process manager | Use a process manager (e.g. systemd, PM2) to keep the app running and restart on failure. |
| Reverse proxy | Put the app behind HTTPS (e.g. nginx, Caddy) and proxy to `http://HOST:PORT`. |

---

## See also

- [Infrastructure](infrastructure/README.md) – Docker, PostgreSQL, troubleshooting
- [API documentation](API/README.md) – Endpoints and usage
- [WhatsApp channel](../src/channels/whatsapp/README.md) – Auth dir, QR, `WHATSAPP_GROUP_ID`, timeout
