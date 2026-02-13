/**
 * RAG LLM integrations
 * Wrappers and configuration for LLM providers: Ollama Cloud (default), OpenAI, etc.
 */
import { getOllamaCloudChat } from "./ollama-cloud.llm.js";
import { getOpenAIChat } from "./openai.llm.js";

export { getOllamaCloudChat } from "./ollama-cloud.llm.js";
export { getOpenAIChat } from "./openai.llm.js";

export type { ChatOpenAI } from "@langchain/openai";
export type { OllamaCloudChat } from "./ollama-cloud.llm.js";

/** Default RAG LLM provider when RAG_LLM_PROVIDER is unset and OPENAI_API_KEY is not set. */
const RAG_LLM_PROVIDER_DEFAULT = "ollama-cloud";

export type RagProvider = "openai" | "ollama-cloud";

/**
 * Returns the configured RAG provider without creating the model.
 * Same logic as getChatModel(): RAG_LLM_PROVIDER wins; else OpenAI if OPENAI_API_KEY set; else Ollama Cloud (default).
 */
export function getRagProvider(): RagProvider {
  const explicit = process.env.RAG_LLM_PROVIDER?.toLowerCase().trim();
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  const provider =
    explicit ?? (hasOpenAIKey ? "openai" : RAG_LLM_PROVIDER_DEFAULT);
  return provider === "openai" ? "openai" : "ollama-cloud";
}

/**
 * Returns the chat model:
 * - If RAG_LLM_PROVIDER is set, use that ("openai" or "ollama-cloud").
 * - If not set and OPENAI_API_KEY is present, use OpenAI.
 * - Otherwise default to Ollama Cloud (main default for the project; override via .env).
 * @throws If provider is "openai" and OPENAI_API_KEY is missing
 */
export function getChatModel():
  | ReturnType<typeof getOpenAIChat>
  | ReturnType<typeof getOllamaCloudChat> {
  const provider = getRagProvider();
  if (provider === "openai") return getOpenAIChat();
  return getOllamaCloudChat();
}
