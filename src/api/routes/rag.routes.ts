import type { FastifyInstance } from "fastify";
import { z } from "zod";
import * as ragController from "../controllers/rag.controller.js";
import { conditionalAuth } from "../middleware/conditionalAuth.js";

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
}
