import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import Fastify from "fastify";
import mainPublicRoutes from "../../src/api/routes/mainPublic.routes.js";
import type { FastifyInstance } from "fastify";

const mockSendOpenPositionsToWhatsApp = vi.fn();

vi.mock("../../src/channels/whatsapp/sendOpenPositions.whatsapp.js", () => ({
  sendOpenPositionsToWhatsApp: (...args: unknown[]) =>
    mockSendOpenPositionsToWhatsApp(...args),
}));

describe("WhatsApp API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    vi.clearAllMocks();
    app = Fastify({ logger: false });
    await app.register(mainPublicRoutes, { prefix: "/api" });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/whatsapp/send-open-positions", () => {
    it("returns 400 when no body.to and WHATSAPP_TARGET_JID is unset", async () => {
      const prev = process.env.WHATSAPP_TARGET_JID;
      delete process.env.WHATSAPP_TARGET_JID;
      const response = await app.inject({
        method: "POST",
        url: "/api/whatsapp/send-open-positions",
        headers: { "content-type": "application/json" },
        payload: {},
      });
      if (prev !== undefined) process.env.WHATSAPP_TARGET_JID = prev;

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body).toHaveProperty("error", "Bad Request");
      expect(body.message).toContain("Missing target");
      expect(mockSendOpenPositionsToWhatsApp).not.toHaveBeenCalled();
    });

    it("returns 200 when mock returns sent: true", async () => {
      mockSendOpenPositionsToWhatsApp.mockResolvedValue({
        sent: true,
        message: "Sent 5 positions to 5511999999999@s.whatsapp.net",
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/whatsapp/send-open-positions",
        headers: { "content-type": "application/json" },
        payload: { to: "5511999999999" },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty("ok", true);
      expect(body).toHaveProperty("message");
      expect(mockSendOpenPositionsToWhatsApp).toHaveBeenCalledWith(
        "5511999999999@s.whatsapp.net"
      );
    });

    it("returns 503 when mock returns sent: false without error", async () => {
      mockSendOpenPositionsToWhatsApp.mockResolvedValue({
        sent: false,
        message: "No open positions available.",
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/whatsapp/send-open-positions",
        headers: { "content-type": "application/json" },
        payload: { to: "5511888888888" },
      });

      expect(response.statusCode).toBe(503);
      const body = response.json();
      expect(body).toHaveProperty("error", "Service Unavailable");
      expect(mockSendOpenPositionsToWhatsApp).toHaveBeenCalledWith(
        "5511888888888@s.whatsapp.net"
      );
    });

    it("returns 504 when error contains timeout", async () => {
      mockSendOpenPositionsToWhatsApp.mockResolvedValue({
        sent: false,
        error: "Connection timeout",
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/whatsapp/send-open-positions",
        headers: { "content-type": "application/json" },
        payload: { to: "5511777777777" },
      });

      expect(response.statusCode).toBe(504);
      expect(response.json()).toHaveProperty("error", "Gateway Timeout");
    });

    it("returns 503 when sent: false with non-timeout error", async () => {
      mockSendOpenPositionsToWhatsApp.mockResolvedValue({
        sent: false,
        error: "WhatsApp not connected",
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/whatsapp/send-open-positions",
        headers: { "content-type": "application/json" },
        payload: { to: "5511777777777" },
      });

      expect(response.statusCode).toBe(503);
      expect(response.json()).toHaveProperty("message");
    });

    it("accepts full JID in body.to", async () => {
      mockSendOpenPositionsToWhatsApp.mockResolvedValue({
        sent: true,
        message: "Sent 1 positions to 5511666666666@s.whatsapp.net",
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/whatsapp/send-open-positions",
        headers: { "content-type": "application/json" },
        payload: { to: "5511666666666@s.whatsapp.net" },
      });

      expect(response.statusCode).toBe(200);
      expect(mockSendOpenPositionsToWhatsApp).toHaveBeenCalledWith(
        "5511666666666@s.whatsapp.net"
      );
    });
  });
});
