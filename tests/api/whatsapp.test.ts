import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import Fastify from "fastify";
import mainPublicRoutes from "../../src/api/routes/mainPublic.routes.js";
import type { FastifyInstance } from "fastify";

const mockSendOpenPositionsToWhatsApp = vi.fn();
const mockSendPositionsListToWhatsApp = vi.fn();
const mockGetOpenPositionsCreatedInLastHours = vi.fn();

vi.mock("../../src/channels/whatsapp/sendOpenPositions.whatsapp.js", () => ({
  sendOpenPositionsToWhatsApp: (...args: unknown[]) =>
    mockSendOpenPositionsToWhatsApp(...args),
  sendPositionsListToWhatsApp: (...args: unknown[]) =>
    mockSendPositionsListToWhatsApp(...args),
}));

vi.mock("../../src/db_operations/models/open_position.model.js", () => ({
  getOpenPositionsCreatedInLastHours: (...args: unknown[]) =>
    mockGetOpenPositionsCreatedInLastHours(...args),
}));

vi.mock("../../src/channels/whatsapp/config.whatsapp.js", () => ({
  whatsappConfig: {
    authDir: "auth_info_baileys",
    targetJid: "",
    printQRInTerminal: true,
  },
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

  describe("POST /api/whatsapp/send-open-positions-last-12h", () => {
    it("returns 400 when no body.to and WHATSAPP_TARGET_JID is unset", async () => {
      const prev = process.env.WHATSAPP_TARGET_JID;
      delete process.env.WHATSAPP_TARGET_JID;
      const response = await app.inject({
        method: "POST",
        url: "/api/whatsapp/send-open-positions-last-12h",
        headers: { "content-type": "application/json" },
        payload: {},
      });
      if (prev !== undefined) process.env.WHATSAPP_TARGET_JID = prev;

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty("error", "Bad Request");
      expect(mockGetOpenPositionsCreatedInLastHours).not.toHaveBeenCalled();
    });

    it("returns 200 when DB returns positions and channel sends", async () => {
      const positions = [
        {
          id: "id-1",
          title: "Dev",
          link: "https://example.com/1",
          companyName: "Co",
          region: "SP",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockGetOpenPositionsCreatedInLastHours.mockResolvedValue(positions);
      mockSendPositionsListToWhatsApp.mockResolvedValue({
        sent: true,
        message: "Sent 1 positions to 5511999999999@s.whatsapp.net",
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/whatsapp/send-open-positions-last-12h",
        headers: { "content-type": "application/json" },
        payload: { to: "5511999999999" },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ ok: true });
      expect(mockGetOpenPositionsCreatedInLastHours).toHaveBeenCalledWith(12);
      expect(mockSendPositionsListToWhatsApp).toHaveBeenCalledWith(
        "5511999999999@s.whatsapp.net",
        [{ title: "Dev", link: "https://example.com/1", companyName: "Co", region: "SP" }],
        "Last 12h open positions (DB)"
      );
    });

    it("returns 503 when sendPositionsListToWhatsApp returns sent: false", async () => {
      mockGetOpenPositionsCreatedInLastHours.mockResolvedValue([
        { id: "1", title: "T", link: "https://x.com", companyName: "C", region: "R", createdAt: new Date(), updatedAt: new Date() },
      ]);
      mockSendPositionsListToWhatsApp.mockResolvedValue({
        sent: false,
        error: "Not connected",
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/whatsapp/send-open-positions-last-12h",
        headers: { "content-type": "application/json" },
        payload: { to: "5511888888888" },
      });

      expect(response.statusCode).toBe(503);
      expect(mockSendPositionsListToWhatsApp).toHaveBeenCalled();
    });
  });
});
