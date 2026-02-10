import { z } from "zod";

/** Request body for POST /api/rag/test (user message for the RAG chain) */
export const ragTestBodySchema = z.object({
  message: z.string().min(1).max(16_384),
});

export type RagTestBody = z.infer<typeof ragTestBodySchema>;
