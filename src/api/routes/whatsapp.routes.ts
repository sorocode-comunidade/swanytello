import type { FastifyInstance } from "fastify";
import { sendOpenPositionsToWhatsApp } from "../../channels/whatsapp/sendOpenPositions.whatsapp.js";
import { whatsappConfig } from "../../channels/whatsapp/config.whatsapp.js";

function toJid(phone: string): string {
  const s = phone.trim();
  if (s.includes("@")) return s;
  const digits = s.replace(/\D/g, "");
  return digits.length ? `${digits}@s.whatsapp.net` : "";
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
    const to = request.body?.to ?? whatsappConfig.targetJid;
    const jid = to ? toJid(to) : "";
    if (!jid) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          "Missing target. Provide body.to (e.g. 5511999999999) or set WHATSAPP_TARGET_JID.",
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
}
