import type { FastifyInstance } from "fastify";
import { checkRagStatus } from "../../utils/ragPing.js";
import openPositionsRoutes from "./openPositions.routes.js";
import whatsappRoutes from "./whatsapp.routes.js";

export default async function mainPublicRoutes(
  fastifyInstance: FastifyInstance
) {
  fastifyInstance.register(openPositionsRoutes);
  fastifyInstance.register(whatsappRoutes);
  fastifyInstance.get("/health", async (_request, reply) => {
    return reply.send({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  /** RAG/LLM health: verify configured provider (Ollama Cloud or OpenAI) is reachable. No auth required. */
  fastifyInstance.get("/rag/health", async (_request, reply) => {
    const status = await checkRagStatus();
    if (status.connected) {
      return reply.send({
        status: "ok",
        provider: status.provider,
        timestamp: new Date().toISOString(),
      });
    }
    return reply.code(503).send({
      statusCode: 503,
      status: "unavailable",
      provider: status.provider,
      message: status.error ?? "RAG/LLM unreachable",
      timestamp: new Date().toISOString(),
    });
  });
}
