import type { FastifyInstance } from "fastify";
import * as ragController from "../controllers/rag.controller.js";
import { conditionalAuth } from "../middleware/conditionalAuth.js";

export default async function ragRoutes(fastifyInstance: FastifyInstance) {
  fastifyInstance.post(
    "/rag/test",
    { onRequest: [conditionalAuth] },
    async (request, reply) => {
      const result = await ragController.testRag(request.user?.id);
      return reply.send(result);
    }
  );
}
