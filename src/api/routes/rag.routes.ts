import type { FastifyInstance } from "fastify";
import { z } from "zod";
import * as ragController from "../controllers/rag.controller.js";
import { conditionalAuth } from "../middleware/conditionalAuth.js";
import {
  ragChatMessageSchema,
  type RagChatPayload,
} from "../schemas/rag.schema.js";
import {
  validateFileSize,
  validateFileType,
  DEFAULT_MAX_SIZE,
} from "../../utils/fileStorage.js";

const PDF_MIME = "application/pdf";
const PDF_FIELD = "pdf";
const MESSAGE_FIELD = "message";

/** Returns a user-friendly message for LLM/network failures (Ollama Cloud down, OpenAI unreachable, etc.) */
function getLLMErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const combined = `${msg} ${cause}`.toLowerCase();
  // Key rejected by OpenAI (401 / invalid / expired)
  if (
    combined.includes("401") ||
    combined.includes("invalid_api_key") ||
    combined.includes("incorrect api key") ||
    combined.includes("invalid api key") ||
    combined.includes("api key")
  ) {
    return (
      "OpenAI rejected the API key (invalid, expired, or revoked). " +
      "Check OPENAI_API_KEY in .env: use a valid key from platform.openai.com, no spaces around '=', key on a single line. " +
      "Call GET /api/rag/health to verify key status."
    );
  }
  if (combined.includes("429") || combined.includes("rate limit")) {
    return "OpenAI rate limit exceeded. Wait a moment and retry, or check your usage at platform.openai.com.";
  }
  if (combined.includes("fetch failed") || combined.includes("econnrefused") || combined.includes("network")) {
    return "LLM service is unreachable. Check that your configured provider (Ollama Cloud or OpenAI) is running and reachable. Call GET /api/rag/health to verify.";
  }
  if (combined.includes("model") && (combined.includes("not found") || combined.includes("does not exist") || combined.includes("invalid"))) {
    return "OpenAI model not available. Set OPENAI_MODEL in .env to a model your account can use (e.g. gpt-4o-mini, gpt-4o). Check platform.openai.com.";
  }
  if (combined.includes("openai")) {
    return (
      "OpenAI API error. Check OPENAI_API_KEY and OPENAI_MODEL in .env and your account at platform.openai.com. " +
      "The 'details' field in this response has the exact error from OpenAI."
    );
  }
  return "LLM service temporarily unavailable. Please try again or check your RAG provider configuration. Call GET /api/rag/health to verify.";
}

/** One-line summary of the raw error for 503 details (helps debug OpenAI/LangChain errors). */
function getRawErrorSummary(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  if (cause && msg !== cause) return `${msg}; cause: ${cause}`;
  return msg;
}

export default async function ragRoutes(fastifyInstance: FastifyInstance) {
  fastifyInstance.post(
    "/rag/test",
    { onRequest: [conditionalAuth] },
    async (request, reply) => {
      try {
        const body = request.body as { message: string };
        const result = await ragController.testRag(body, request.user?.id);
        return reply.send(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Validation error",
            details: error.issues,
          });
        }
        const err = error instanceof Error ? error : new Error(String(error));
        const causeMsg = err.cause instanceof Error ? err.cause.message : "";
        if (
          err.message.includes("fetch failed") ||
          /econnrefused|fetch failed|network|unreachable|openai|ollama|api key/i.test(err.message + " " + causeMsg)
        ) {
          return reply.code(503).send({
            statusCode: 503,
            error: "Service Unavailable",
            message: getLLMErrorMessage(error),
            details: getRawErrorSummary(error),
          });
        }
        throw error;
      }
    }
  );

  /** POST /rag/chat: multipart form with message (required) and optional PDF for future tag extraction */
  fastifyInstance.post(
    "/rag/chat",
    { onRequest: [conditionalAuth] },
    async (request, reply) => {
      try {
        if (!request.isMultipart()) {
          return reply.code(400).send({
            error: "Bad request",
            message: "Content-Type must be multipart/form-data",
          });
        }

        let message: string | null = null;
        let pdfBuffer: Buffer | undefined;
        let pdfFilename: string | undefined;

        const parts = request.parts();
        for await (const part of parts) {
          if (part.type === "field") {
            if (part.fieldname === MESSAGE_FIELD) {
              message = part.value as string;
            }
            continue;
          }
          if (part.type === "file" && part.fieldname === PDF_FIELD) {
            const mimetype = part.mimetype;
            const filename = part.filename ?? "document.pdf";
            if (!validateFileType(mimetype, filename, [PDF_MIME])) {
              return reply.code(400).send({
                error: "Validation error",
                message: "File must be a PDF (application/pdf)",
              });
            }
            const buffer = await part.toBuffer();
            if (!validateFileSize(buffer.length, DEFAULT_MAX_SIZE)) {
              return reply.code(400).send({
                error: "Validation error",
                message: `PDF size must not exceed ${DEFAULT_MAX_SIZE / 1024 / 1024}MB`,
              });
            }
            pdfBuffer = buffer;
            pdfFilename = filename;
          }
        }

        const parsedMessage = ragChatMessageSchema.safeParse(message);
        if (!parsedMessage.success) {
          return reply.code(400).send({
            error: "Validation error",
            details: parsedMessage.error.issues,
          });
        }

        const payload: RagChatPayload = {
          message: parsedMessage.data,
          ...(pdfBuffer && { pdfBuffer, pdfFilename }),
        };
        const result = await ragController.chatRag(payload, request.user?.id);
        return reply.send(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Validation error",
            details: error.issues,
          });
        }
        const err = error instanceof Error ? error : new Error(String(error));
        const causeMsg = err.cause instanceof Error ? err.cause.message : "";
        if (
          err.message.includes("fetch failed") ||
          /econnrefused|fetch failed|network|unreachable|openai|ollama|api key/i.test(err.message + " " + causeMsg)
        ) {
          return reply.code(503).send({
            statusCode: 503,
            error: "Service Unavailable",
            message: getLLMErrorMessage(error),
            details: getRawErrorSummary(error),
          });
        }
        throw error;
      }
    }
  );
}
