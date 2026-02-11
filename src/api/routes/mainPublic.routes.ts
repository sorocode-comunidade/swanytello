import type { FastifyInstance } from "fastify";
import { checkRagStatus } from "../../utils/ragPing.js";

export default async function mainPublicRoutes(
  fastifyInstance: FastifyInstance
) {
  fastifyInstance.get("/health", async (_request, reply) => {
    return reply.send({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  /** RAG/LLM health: verify configured provider (Ollama or OpenAI) is reachable. No auth required. For Ollama, includes container status so you know in advance if Docker is running. */
  fastifyInstance.get("/rag/health", async (_request, reply) => {
    const status = await checkRagStatus();
    const payload =
      status.provider === "ollama" && status.containerRunning !== undefined
        ? { containerRunning: status.containerRunning }
        : {};
    if (status.connected) {
      return reply.send({
        status: "ok",
        provider: status.provider,
        ...payload,
        timestamp: new Date().toISOString(),
      });
    }
    return reply.code(503).send({
      statusCode: 503,
      status: "unavailable",
      provider: status.provider,
      ...payload,
      message: status.error ?? "RAG/LLM unreachable",
      timestamp: new Date().toISOString(),
    });
  });
}
