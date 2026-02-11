import { getChatModel } from "../llms/index.js";

/** Optional PDF context for the chat (for future tag-extraction or other RAG tools) */
export interface ChatAttachment {
  pdfBuffer?: Buffer;
  pdfFilename?: string;
}

/**
 * Runs the chat chain: user message → LLM (Ollama or OpenAI per RAG_LLM_PROVIDER) → reply.
 * No retrieval or tools in this minimal chain. Optional attachment (e.g. PDF) is accepted
 * and can be used by future tools (e.g. extract tags from PDF).
 *
 * @param message – User message content
 * @param attachment – Optional PDF buffer/filename for future tooling (e.g. tag extraction)
 * @returns The LLM reply text
 * @throws Rethrows LLM/network errors (e.g. Ollama unreachable, OpenAI API key missing) so the API can map to 502/503
 */
export async function runChatChain(
  message: string,
  attachment?: ChatAttachment
): Promise<string> {
  const llm = getChatModel();
  // Attachment (e.g. PDF) is available for future tools; current chain only uses message
  void attachment; // reserved for future tag-extraction tool
  const result = await llm.invoke(message);
  const content = result.content;
  if (typeof content !== "string") {
    return Array.isArray(content) ? content.map((c) => String(c)).join("") : String(content);
  }
  return content;
}
