import { z } from "zod";

/** Request body for POST /api/rag/test (user message for the RAG chain) */
export const ragTestBodySchema = z.object({
  message: z.string().min(1).max(16_384),
});

export type RagTestBody = z.infer<typeof ragTestBodySchema>;

/** Message validation for POST /api/rag/chat (multipart: message + optional PDF) */
export const ragChatMessageSchema = z
  .string()
  .min(1, "message is required")
  .max(16_384);

export type RagChatMessage = z.infer<typeof ragChatMessageSchema>;

/** Result of parsing chat multipart: message + optional PDF buffer for future tag extraction */
export interface RagChatPayload {
  message: string;
  pdfBuffer?: Buffer;
  pdfFilename?: string;
}
