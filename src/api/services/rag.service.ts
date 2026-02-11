import { ragTestBodySchema, type RagTestBody } from "../schemas/rag.schema.js";
import { runChatChain } from "../../rag/chains/chat.chain.js";

/**
 * Validates the request body and runs the RAG chat chain with the user message.
 * Returns the reply and timestamp for the API response.
 */
export async function runRagChat(body: unknown): Promise<{
  reply: string;
  timestamp: string;
}> {
  const parsed = ragTestBodySchema.parse(body) as RagTestBody;
  const reply = await runChatChain(parsed.message);
  return {
    reply,
    timestamp: new Date().toISOString(),
  };
}
