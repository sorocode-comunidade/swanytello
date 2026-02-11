# Postman – Swanytello RAG API

Use this folder to test the RAG API from Postman.

---

## 1. Import the collection

1. Open Postman.
2. **Import** → **File** → choose `Swanytello-RAG.postman_collection.json` from this folder (or drag and drop).
3. The collection **Swanytello RAG API** will appear in your sidebar.

---

## 2. Set the base URL

1. Click the collection **Swanytello RAG API**.
2. Open the **Variables** tab.
3. Set **baseUrl** to your server (e.g. `http://localhost:3000`). **Current value** is used when you send a request.

---

## 3. Auth: why POST can fail when GET /api/rag/health works

- **GET /api/rag/health** does **not** require auth → it can return 200 even if you never send a token.
- **POST /api/rag/test** and **POST /api/rag/chat** are **protected**: they require a valid JWT when `AUTH_STATUS=on` in `.env`.

So if the health check is OK but POST returns **401 Unauthorized**, the problem is auth, not the LLM.

---

## 4. Option A: Bypass auth (easiest for local dev)

1. In your project `.env`, set:
   ```env
   AUTH_STATUS=off
   ```
2. Restart the server.
3. In Postman, for **POST /api/rag/test** and **POST /api/rag/chat**:
   - Leave the **Authorization** header **disabled** (or delete it).
4. Send the request again. It should return 200 and a reply.

---

## 5. Option B: Use a JWT (when AUTH_STATUS=on)

1. From the project root, run:
   ```bash
   npm run dev-token
   ```
   (or `node -r dotenv/config scripts/dev-token.mjs`)
2. Copy the printed token.
3. In Postman, open the collection **Variables** and set **token** to that value (paste in **Current value**).
4. In each POST request (**POST /api/rag/test** and **POST /api/rag/chat**):
   - Enable the **Authorization** header.
   - Value should be: `Bearer {{token}}`.
5. Send the request.

---

## 6. Request bodies

- **POST /api/rag/test**
  - **Body** → **raw** → **JSON**
  - Example: `{ "message": "Hello, reply in one short sentence." }`

- **POST /api/rag/chat**
  - **Body** → **form-data**
  - Add key `message` (text) and, if you want, key `pdf` (file).
  - Do **not** use **x-www-form-urlencoded** or **raw JSON** — the endpoint expects **multipart/form-data**.

---

## 7. If you still get an error

Note the **status code** and **response body**:

- **401** → Auth issue. Use Option A or B above.
- **400** → Validation (e.g. missing `message`, or wrong body type for /api/rag/chat).
- **503** → LLM unreachable or key invalid. Call **GET /api/rag/health** to see the exact message.

If you share the status code and body, we can narrow it down.
