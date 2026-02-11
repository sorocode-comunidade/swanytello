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

export interface RagStatus {
  provider: RagProvider;
  connected: boolean;
  keySet?: boolean;
  error?: string;
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
        ? `Ollama not reachable at ${baseUrl}. Start Ollama or set OPENAI_API_KEY to use OpenAI.`
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

  const result = await pingOllama();
  return {
    provider: "ollama",
    connected: result.connected,
    error: result.error,
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

  if (status.connected) {
    console.log("✅ RAG (Ollama): Connected");
    console.log("   🎉 RAG ready!\n");
    return true;
  }
  console.log("❌ RAG (Ollama): Not reachable");
  if (status.error) console.log(`   Error: ${status.error}`);
  console.log(
    "   💡 Start Ollama: npm run docker:up:ollama (or: docker compose -f docker/docker-compose.yml up -d ollama). Or set OPENAI_API_KEY to use OpenAI.\n"
  );
  return false;
}
