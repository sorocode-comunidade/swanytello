import type { FastifyInstance } from "fastify";
import { sendOpenPositionsToWhatsApp } from "../../channels/whatsapp/sendOpenPositions.whatsapp.js";
import { whatsappConfig } from "../../channels/whatsapp/config.whatsapp.js";
import { sendLast12hOpenPositionsToWhatsApp } from "../services/whatsapp.service.js";

function toJid(phone: string): string {
  const s = phone.trim();
  if (s.includes("@")) return s;
  const digits = s.replace(/\D/g, "");
  return digits.length ? `${digits}@s.whatsapp.net` : "";
}

/** Resolve target: empty string → WHATSAPP_GROUP_ID; missing → WHATSAPP_TARGET_JID; else body.to. */
function resolveTo(bodyTo: string | undefined): string {
  if (bodyTo === "") return whatsappConfig.groupId;
  return bodyTo ?? whatsappConfig.targetJid;
}

export default async function whatsappRoutes(
  fastifyInstance: FastifyInstance
) {
  /**
   * POST /api/whatsapp/send-open-positions
   * Sends the last retrieved open positions (from ETL) to a WhatsApp number.
   * Body: { "to": "5511999999999" } (optional; if omitted, uses WHATSAPP_TARGET_JID env).
   */
  fastifyInstance.post<{
    Body?: { to?: string };
  }>("/whatsapp/send-open-positions", async (request, reply) => {
    const to = resolveTo(request.body?.to);
    const jid = to ? toJid(to) : "";
    if (!jid) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          "Missing target. Provide body.to (e.g. 5511999999999), or body.to=\"\" with WHATSAPP_GROUP_ID, or set WHATSAPP_TARGET_JID.",
      });
    }

    const result = await sendOpenPositionsToWhatsApp(jid);
    if (!result.sent) {
      const code = result.error?.toLowerCase().includes("timeout") ? 504 : 503;
      return reply.code(code).send({
        statusCode: code,
        error: code === 504 ? "Gateway Timeout" : "Service Unavailable",
        message: result.message ?? result.error ?? "Failed to send to WhatsApp.",
      });
    }
    return reply.send({ ok: true, message: result.message });
  });

  /**
   * POST /api/whatsapp/send-open-positions-last-12h
   * Fetches open positions created in the last 12 hours from the DB and sends them to WhatsApp.
   * Useful for testing the WhatsApp implementation. Body: { "to": "5511999999999" } (optional).
   */
  fastifyInstance.post<{
    Body?: { to?: string };
  }>("/whatsapp/send-open-positions-last-12h", async (request, reply) => {
    const to = resolveTo(request.body?.to);
    const jid = to ? toJid(to) : "";
    if (!jid) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          "Missing target. Provide body.to (e.g. 5511999999999), or body.to=\"\" with WHATSAPP_GROUP_ID, or set WHATSAPP_TARGET_JID.",
      });
    }

    try {
      const result = await sendLast12hOpenPositionsToWhatsApp(jid);
      if (!result.sent) {
        const code = result.error?.toLowerCase().includes("timeout") ? 504 : 503;
        return reply.code(code).send({
          statusCode: code,
          error: code === 504 ? "Gateway Timeout" : "Service Unavailable",
          message: result.message ?? result.error ?? "Failed to send to WhatsApp.",
        });
      }
      return reply.send({ ok: true, message: result.message });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      return reply.code(503).send({
        statusCode: 503,
        error: "Service Unavailable",
        message: error,
      });
    }
  });
}
