import type { FastifyInstance } from "fastify";
import { getLastRetrieved } from "../../etl/lastRetrievedStore.js";

export default async function openPositionsRoutes(
  fastifyInstance: FastifyInstance
) {
  /**
   * GET /api/open-positions/last-retrieved
   * Returns the last batch of open positions retrieved by the ETL (LinkedIn scrape).
   * Includes metadata: retrievedAt, counts (extracted, transformed, created, skipped) and the positions array.
   * Returns 404 if no ETL run has completed yet.
   */
  fastifyInstance.get("/open-positions/last-retrieved", async (_request, reply) => {
    const snapshot = getLastRetrieved();
    if (!snapshot) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "No ETL run has completed yet. Last retrieved open positions are not available.",
      });
    }
    return reply.send(snapshot);
  });
}
