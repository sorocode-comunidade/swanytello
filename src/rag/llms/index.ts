/**
 * RAG LLM integrations
 * Wrappers and configuration for LLM providers: OpenAI, Claude, Ollama, etc.
 */
import { getOllamaChat } from "./ollama.llm.js";
import { getOpenAIChat } from "./openai.llm.js";

export { getOllamaChat } from "./ollama.llm.js";
export { getOpenAIChat } from "./openai.llm.js";

export type { ChatOllama } from "@langchain/ollama";
export type { ChatOpenAI } from "@langchain/openai";

const RAG_LLM_PROVIDER_DEFAULT = "ollama";

/**
 * Returns the chat model configured by RAG_LLM_PROVIDER (default "ollama").
 * - "ollama" → getOllamaChat() (OLLAMA_BASE_URL, OLLAMA_MODEL)
 * - "openai" → getOpenAIChat() (OPENAI_API_KEY, OPENAI_MODEL)
 * @throws If provider is "openai" and OPENAI_API_KEY is missing
 */
export function getChatModel(): ReturnType<typeof getOllamaChat> | ReturnType<typeof getOpenAIChat> {
  const provider = (process.env.RAG_LLM_PROVIDER ?? RAG_LLM_PROVIDER_DEFAULT).toLowerCase();
  if (provider === "openai") return getOpenAIChat();
  return getOllamaChat();
}
