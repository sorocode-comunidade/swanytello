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

const RAG_LLM_PROVIDER_DEFAULT_OLLAMA = "ollama";

export type RagProvider = "openai" | "ollama";

/**
 * Returns the configured RAG provider without creating the model.
 * Same logic as getChatModel(): RAG_LLM_PROVIDER wins; else OpenAI if OPENAI_API_KEY set; else Ollama.
 */
export function getRagProvider(): RagProvider {
  const explicit = process.env.RAG_LLM_PROVIDER?.toLowerCase().trim();
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  const provider =
    explicit ?? (hasOpenAIKey ? "openai" : RAG_LLM_PROVIDER_DEFAULT_OLLAMA);
  return provider === "openai" ? "openai" : "ollama";
}

/**
 * Returns the chat model:
 * - If RAG_LLM_PROVIDER is set, use that ("openai" or "ollama").
 * - If not set and OPENAI_API_KEY is present, use OpenAI.
 * - Otherwise default to Ollama.
 * @throws If provider is "openai" and OPENAI_API_KEY is missing
 */
export function getChatModel(): ReturnType<typeof getOllamaChat> | ReturnType<typeof getOpenAIChat> {
  if (getRagProvider() === "openai") return getOpenAIChat();
  return getOllamaChat();
}
