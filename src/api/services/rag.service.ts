import {
  ragTestBodySchema,
  type RagTestBody,
  type RagChatPayload,
} from "../schemas/rag.schema.js";
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

/**
 * Runs the RAG chat chain with message and optional PDF.
 * PDF is passed to the chain for future tag-extraction tooling (e.g. extract tags from PDF).
 */
export async function runRagChatWithPdf(payload: RagChatPayload): Promise<{
  reply: string;
  timestamp: string;
}> {
  const reply = await runChatChain(payload.message, {
    pdfBuffer: payload.pdfBuffer,
    pdfFilename: payload.pdfFilename,
  });
  return {
    reply,
    timestamp: new Date().toISOString(),
  };
}
