import { getOllamaChat } from "../llms/ollama.js";

/**
 * Runs the chat chain: user message → Ollama LLM → reply.
 * No retrieval or tools in this minimal chain.
 *
 * @param message – User message content
 * @returns The LLM reply text
 * @throws Rethrows LLM/network errors (e.g. Ollama unreachable) so the API can map to 502/503
 */
export async function runChatChain(message: string): Promise<string> {
  const llm = getOllamaChat();
  const result = await llm.invoke(message);
  const content = result.content;
  if (typeof content !== "string") {
    return Array.isArray(content) ? content.map((c) => String(c)).join("") : String(content);
  }
  return content;
}
