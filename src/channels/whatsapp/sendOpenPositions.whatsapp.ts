/**
 * Sends the last retrieved open positions to a WhatsApp JID as a formatted text message.
 * Uses the last-retrieved store (ETL) and the WhatsApp client.
 * @module channels/whatsapp/sendOpenPositions.whatsapp
 */

import { getLastRetrieved } from "../../etl/lastRetrievedStore.js";
import { sendTextMessage } from "./client.whatsapp.js";

const MAX_MESSAGE_LENGTH = 65000;

function formatPositionsAsText(
  positions: Array<{ title: string; companyName: string; region: string; link: string }>,
  retrievedAt: string,
  created: number,
  skipped: number
): string {
  const header = [
    `📋 *Últimas vagas (LinkedIn)*`,
    `Retrieved: ${retrievedAt}`,
    `Created: ${created} | Skipped: ${skipped}`,
    ``,
  ].join("\n");

  const lines = positions.map((p, i) => {
    return `${i + 1}. *${p.title}* @ ${p.companyName}\n   ${p.region}\n   ${p.link}`;
  });

  const body = lines.join("\n\n");
  const text = header + body;
  if (text.length <= MAX_MESSAGE_LENGTH) return text;

  return header + body.slice(0, MAX_MESSAGE_LENGTH - header.length - 50) + "\n\n... (truncated)";
}

export interface SendOpenPositionsResult {
  sent: boolean;
  message?: string;
  error?: string;
}

/**
 * Sends the last retrieved open positions to the given WhatsApp JID.
 * Uses getLastRetrieved(); if none, returns { sent: false, message: "..." }.
 *
 * @param jid - WhatsApp ID (e.g. 5511999999999@s.whatsapp.net)
 */
export async function sendOpenPositionsToWhatsApp(
  jid: string
): Promise<SendOpenPositionsResult> {
  const snapshot = getLastRetrieved();
  if (!snapshot || snapshot.positions.length === 0) {
    return {
      sent: false,
      message: "No open positions available. Run ETL first (or wait for the next run).",
    };
  }

  try {
    const text = formatPositionsAsText(
      snapshot.positions,
      snapshot.retrievedAt,
      snapshot.created,
      snapshot.skipped
    );
    await sendTextMessage(jid, text);
    return { sent: true, message: `Sent ${snapshot.positions.length} positions to ${jid}` };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { sent: false, error };
  }
}
