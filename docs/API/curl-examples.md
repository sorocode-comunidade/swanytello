# Test API endpoints via terminal (curl)

Use these commands with the server running at `http://localhost:3000` (or set `BASE` and use `$BASE`).

```bash
# Optional: set base URL once
BASE=http://localhost:3000
```

---

## Public (no auth)

### Health
```bash
curl -s http://localhost:3000/api/health
```

### RAG health
```bash
curl -s http://localhost:3000/api/rag/health
```

### Open positions – last retrieved
```bash
curl -s http://localhost:3000/api/open-positions/last-retrieved
```

### WhatsApp – send open positions (ETL snapshot)
```bash
# Replace with your number or group JID (e.g. 120363123456789012@g.us)
curl -s -X POST http://localhost:3000/api/whatsapp/send-open-positions \
  -H "Content-Type: application/json" \
  -d '{"to": "5511999999999"}'

# Or use WHATSAPP_TARGET_JID (empty body)
curl -s -X POST http://localhost:3000/api/whatsapp/send-open-positions \
  -H "Content-Type: application/json" \
  -d '{}'
```

### WhatsApp – send last 12h from DB
```bash
curl -s -X POST http://localhost:3000/api/whatsapp/send-open-positions-last-12h \
  -H "Content-Type: application/json" \
  -d '{"to": "5511999999999"}'
```

---

## Protected (JWT when AUTH_STATUS=ON)

Replace `YOUR_JWT` with a token (e.g. from `npm run dev-token` when AUTH_STATUS=ON).

### RAG test
```bash
curl -s -X POST http://localhost:3000/api/rag/test \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### RAG chat (multipart: message + optional PDF)
```bash
curl -s -X POST http://localhost:3000/api/rag/chat \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "message=Hello" \
  -F "pdf=@/path/to/file.pdf"
```

### User – list all
```bash
curl -s -H "Authorization: Bearer YOUR_JWT" http://localhost:3000/api/user
```

### User – get by id
```bash
curl -s -H "Authorization: Bearer YOUR_JWT" "http://localhost:3000/api/user?id=USER_ID"
```

### User – create
```bash
curl -s -X POST http://localhost:3000/api/user \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"username":"jane","email":"jane@example.com","password":"secret123","name":"Jane Doe"}'
```

### User – update
```bash
curl -s -X PUT http://localhost:3000/api/user/USER_ID \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith"}'
```

### User – delete
```bash
curl -s -X DELETE -H "Authorization: Bearer YOUR_JWT" http://localhost:3000/api/user/USER_ID
```

---

## See also

- [API index](README.md) – Full endpoint list and links to detailed docs.
- [Postman collection](../../api/Swanytello-API.postman_collection.json) – Import in Postman for the same endpoints.
