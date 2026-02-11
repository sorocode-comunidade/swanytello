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
        throw error;
      }
    }
  );
}
