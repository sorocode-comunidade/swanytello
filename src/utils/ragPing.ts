/**
 * RAG Ping Utility
 * Verifies RAG/LLM configuration and reachability at startup and via GET /api/rag/health.
 */

import { getRagProvider, type RagProvider } from "../rag/llms/index.js";

const OLLAMA_DEFAULT_BASE_URL = "http://localhost:11434";
const OPENAI_MODELS_URL = "https://api.openai.com/v1/models";

/** Match how openai.llm normalizes the key (trim + strip newlines from .env). */
function normalizeOpenAIKey(value: string | undefined): string {
  return value?.replace(/\r\n|\r|\n/g, "").trim() ?? "";
}

const OLLAMA_CONTAINER_NAME = "swanytello-ollama";

export interface RagStatus {
  provider: RagProvider;
  connected: boolean;
  keySet?: boolean;
  /** When provider is ollama: whether the Docker container is running (so we know in advance if we can use it). */
  containerRunning?: boolean;
  error?: string;
}

/**
 * Check if the Ollama Docker container (swanytello-ollama) is running.
 * Same pattern as dbPing for Postgres: we know in advance if Docker is up before pinging the API.
 */
async function checkOllamaContainerStatus(): Promise<{ running: boolean }> {
  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);
    try {
      const { stdout } = await execAsync(
        `docker ps --filter "name=${OLLAMA_CONTAINER_NAME}" --format "{{.Names}}:{{.Status}}"`
      );
      const isRunning = stdout.trim().includes(OLLAMA_CONTAINER_NAME);
      return { running: isRunning };
    } catch {
      return { running: false };
    }
  } catch {
    return { running: false };
  }
}

/**
 * Ping Ollama: GET baseUrl/api/tags to verify the service is up.
 */
async function pingOllama(): Promise<{ connected: boolean; error?: string }> {
  const baseUrl = (process.env.OLLAMA_BASE_URL ?? OLLAMA_DEFAULT_BASE_URL).trim().replace(/\/$/, "");
  const url = `${baseUrl}/api/tags`;

  try {
    const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(5000) });
    if (res.ok) return { connected: true };
    return {
      connected: false,
      error: `Ollama returned ${res.status} at ${baseUrl}`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      error: msg.includes("ECONNREFUSED")
        ? `Ollama not reachable at ${baseUrl}. Start Ollama (npm run docker:up:ollama) or set OPENAI_API_KEY to use OpenAI.`
        : msg,
    };
  }
}

/**
 * Ping OpenAI: verify API key is set and optional GET /v1/models to validate key.
 */
async function pingOpenAI(): Promise<{ connected: boolean; keySet: boolean; error?: string }> {
  const apiKey = normalizeOpenAIKey(process.env.OPENAI_API_KEY);
  if (!apiKey) {
    return {
      connected: false,
      keySet: false,
      error:
        "OPENAI_API_KEY is not set. Add it to .env (e.g. OPENAI_API_KEY=sk-...) and ensure the app loads .env at startup.",
    };
  }

  try {
    const res = await fetch(OPENAI_MODELS_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) return { connected: true, keySet: true };
    if (res.status === 401) {
      return {
        connected: false,
        keySet: true,
        error:
          "OpenAI API key is invalid or expired. Get a valid key at platform.openai.com and set OPENAI_API_KEY in .env (no spaces around '=', key on one line).",
      };
    }
    return {
      connected: false,
      keySet: true,
      error: `OpenAI API returned ${res.status}`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      keySet: true,
      error: msg.includes("fetch") ? "OpenAI API unreachable (network or DNS)." : msg,
    };
  }
}

/**
 * Check RAG/LLM status for the configured provider.
 * For Ollama: checks Docker container status first, then pings the API (same idea as Postgres ping).
 */
export async function checkRagStatus(): Promise<RagStatus> {
  const provider = getRagProvider();

  if (provider === "openai") {
    const result = await pingOpenAI();
    return {
      provider: "openai",
      connected: result.connected,
      keySet: result.keySet,
      error: result.error,
    };
  }

  const containerStatus = await checkOllamaContainerStatus();
  const apiResult = await pingOllama();
  return {
    provider: "ollama",
    connected: apiResult.connected,
    containerRunning: containerStatus.running,
    error: apiResult.error,
  };
}

/**
 * Display RAG status to console at startup (mirrors displayDatabaseStatus).
 */
export async function displayRagStatus(): Promise<boolean> {
  console.log("\n🔍 Checking RAG/LLM connection...\n");

  const status = await checkRagStatus();

  if (status.provider === "openai") {
    if (status.keySet === false) {
      console.log("❌ RAG (OpenAI): OPENAI_API_KEY is not set in .env");
      console.log("   Add OPENAI_API_KEY=sk-... to .env and restart.");
      console.log("   Or use Ollama: ensure RAG_LLM_PROVIDER is unset, leave OPENAI_API_KEY unset, and start Ollama.\n");
      return false;
    }
    if (status.connected) {
      console.log("✅ RAG (OpenAI): API key valid and reachable");
      console.log("   🎉 RAG ready!\n");
      return true;
    }
    console.log("❌ RAG (OpenAI): Not reachable or key invalid");
    if (status.error) console.log(`   Error: ${status.error}`);
    console.log("");
    return false;
  }

  // Ollama: show container status first (same as DB ping), then API connection
  if (status.containerRunning) {
    console.log("✅ Ollama Docker container: Running");
  } else {
    console.log("❌ Ollama Docker container: Not running");
    console.log(
      "   💡 Start with: npm run docker:up:ollama (or: docker compose -f docker/docker-compose.yml up -d ollama)"
    );
    console.log("   Or set OPENAI_API_KEY in .env to use OpenAI instead.\n");
    return false;
  }

  if (status.connected) {
    console.log("✅ RAG (Ollama): API reachable");
    console.log("   🎉 RAG ready!\n");
    return true;
  }
  console.log("❌ RAG (Ollama): Container running but API not reachable");
  if (status.error) console.log(`   Error: ${status.error}`);
  console.log(
    "   💡 Check OLLAMA_BASE_URL in .env (default http://localhost:11434) or pull a model: docker exec -it swanytello-ollama ollama run llama3.2\n"
  );
  return false;
}
