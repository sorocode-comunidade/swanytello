# API – Postman collection

This folder contains a **Postman collection** with all Swanytello API endpoints so you can import and run them from Postman.

## File

- **Swanytello-API.postman_collection.json** – Postman Collection v2.1.

## How to import

1. Open Postman.
2. Click **Import** and choose **Upload Files** (or drag and drop).
3. Select `api/Swanytello-API.postman_collection.json`.
4. The collection **Swanytello API** will appear in your sidebar.

## Collection variables

| Variable | Default | Description |
|----------|---------|-------------|
| `base_url` | `http://localhost:3000` | API base URL. Change for staging/production. |
| `token` | (empty) | JWT for protected routes. Set after logging in or using `npm run dev-token` (when AUTH_STATUS=ON). |

To set the token: open the collection → **Variables** tab → set `token` to your JWT (e.g. from `npm run dev-token`). Requests under RAG and User use `Authorization: Bearer {{token}}`.

## Folders

- **Public** – Health, RAG Health, Open Positions (last retrieved), WhatsApp (send open positions, send last 12h). No auth.
- **RAG** – RAG Test (JSON message), RAG Chat (multipart: message + optional PDF). Auth when AUTH_STATUS=ON.
- **User** – GET users, POST create, PUT update, DELETE. Auth when AUTH_STATUS=ON.

## See also

- [API documentation](../docs/API/README.md) – Full endpoint list and per-route docs.
