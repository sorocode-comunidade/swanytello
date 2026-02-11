import { ChatOllama } from "@langchain/ollama";

const defaultBaseUrl = "http://localhost:11434";
const defaultModel = "llama3.2";

let ollamaInstance: ChatOllama | null = null;

/**
 * Returns a shared ChatOllama instance configured from env.
 * Uses OLLAMA_BASE_URL (default http://localhost:11434) and OLLAMA_MODEL (default llama3.2).
 */
export function getOllamaChat(): ChatOllama {
  if (!ollamaInstance) {
    const baseUrl = process.env.OLLAMA_BASE_URL ?? defaultBaseUrl;
    const model = process.env.OLLAMA_MODEL ?? defaultModel;
    ollamaInstance = new ChatOllama({
      baseUrl,
      model,
    });
  }
  return ollamaInstance;
}
