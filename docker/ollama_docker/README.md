# Ollama (Docker)

Ollama service for Swanytello RAG when not using OpenAI. Runs the [ollama/ollama](https://hub.docker.com/r/ollama/ollama) image. Defined in the main [docker-compose.yml](../docker-compose.yml) as the `ollama` service.

---

## Quick reference

| Item | Value |
|------|--------|
| **Container name** | `swanytello-ollama` |
| **Image** | `ollama/ollama` |
| **Port** | `11434` (host) → `11434` (container). Override with `OLLAMA_PORT` in `.env` or environment. |
| **Volume** | `ollama_data` → `/root/.ollama` (models and data persist here) |

---

## Start / stop

From the **project root**:

```bash
# Start Ollama only
docker compose -f docker/docker-compose.yml up -d ollama
# Or with alias: dcp up -d ollama

# Stop
docker compose -f docker/docker-compose.yml stop ollama
# Or: dcp stop ollama

# Logs
docker compose -f docker/docker-compose.yml logs -f ollama
# Or: dcp logs -f ollama
```

---

## Pull and run a model

After the container is running, pull and run a model inside the container:

```bash
# Enter the container and run a model (interactive)
docker exec -it swanytello-ollama ollama run llama3

# Or only pull a model (no interactive chat)
docker exec -it swanytello-ollama ollama pull llama3
docker exec -it swanytello-ollama ollama pull llama3.2
```

More models: [Ollama library](https://ollama.com/library).

---

## Application configuration

When the app runs on the **host** (e.g. `npm run dev`), it connects to Ollama at `localhost:11434`. In `.env`:

- Do **not** set `OPENAI_API_KEY` if you want to use Ollama (or set `RAG_LLM_PROVIDER=ollama`).
- Optional: `OLLAMA_BASE_URL=http://localhost:11434` (default).
- Optional: `OLLAMA_MODEL=llama3.2` (or the model you pulled).

When the app runs **inside Docker** on the same Compose network, use `OLLAMA_BASE_URL=http://ollama:11434`.

---

## Health check

From the host:

```bash
curl -s http://localhost:11434/api/tags
```

Or use the app’s RAG health endpoint:

```bash
curl -s http://localhost:3000/api/rag/health
```

---

## See also

- [Docker README](../README.md) – Main Docker usage and alias (`dcp`)
- [RAG documentation](../../docs/rag.md) – LLM provider selection (Ollama vs OpenAI)
- [Ollama on Docker Hub](https://hub.docker.com/r/ollama/ollama)
