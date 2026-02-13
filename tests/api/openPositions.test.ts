import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import mainPublicRoutes from "../../src/api/routes/mainPublic.routes.js";
import { setLastRetrieved } from "../../src/etl/lastRetrievedStore.js";
import type { FastifyInstance } from "fastify";

describe("Open positions API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(mainPublicRoutes, { prefix: "/api" });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/open-positions/last-retrieved", () => {
    it("returns 200 and snapshot when last retrieved is set", async () => {
      const snapshot = {
        retrievedAt: "2025-02-13T14:00:00.000Z",
        extracted: 3,
        transformed: 3,
        created: 2,
        skipped: 1,
        positions: [
          {
            title: "Dev Backend",
            link: "https://linkedin.com/jobs/1",
            companyName: "Company A",
            region: "Sorocaba",
          },
        ],
      };
      setLastRetrieved(snapshot);

      const response = await app.inject({
        method: "GET",
        url: "/api/open-positions/last-retrieved",
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty("retrievedAt", snapshot.retrievedAt);
      expect(body).toHaveProperty("extracted", 3);
      expect(body).toHaveProperty("transformed", 3);
      expect(body).toHaveProperty("created", 2);
      expect(body).toHaveProperty("skipped", 1);
      expect(body).toHaveProperty("positions");
      expect(Array.isArray(body.positions)).toBe(true);
      expect(body.positions[0]).toMatchObject({
        title: "Dev Backend",
        link: "https://linkedin.com/jobs/1",
        companyName: "Company A",
        region: "Sorocaba",
      });
    });

  });
});
