/**
 * Sends the last retrieved open positions to a WhatsApp JID as a formatted text message.
 * Uses the last-retrieved store (ETL) and the WhatsApp client.
 * @module channels/whatsapp/sendOpenPositions.whatsapp
 */

import { getLastRetrieved } from "../../etl/lastRetrievedStore.js";
import { sendTextMessage } from "./client.whatsapp.js";

const MAX_MESSAGE_LENGTH = 65000;

/** Messages sent when there are no open positions to send (alternate between them). */
const NO_POSITIONS_MESSAGES = [
  "Nenhuma vaga nova ao Sol por enquanto pessoal.",
  "Não há vagas!",
] as const;

let noPositionsMessageIndex = 0;

function getNextNoPositionsMessage(): string {
  const msg = NO_POSITIONS_MESSAGES[noPositionsMessageIndex];
  noPositionsMessageIndex = (noPositionsMessageIndex + 1) % NO_POSITIONS_MESSAGES.length;
  return msg;
}

export type PositionForMessage = {
  title: string;
  companyName: string;
  region: string;
  link: string;
};

function formatPositionsAsText(
  positions: PositionForMessage[],
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

  const body = formatPositionsBody(positions);
  const text = header + body;
  if (text.length <= MAX_MESSAGE_LENGTH) return text;

  return header + body.slice(0, MAX_MESSAGE_LENGTH - header.length - 50) + "\n\n... (truncated)";
}

function formatPositionsBody(positions: PositionForMessage[]): string {
  const lines = positions.map((p, i) => {
    return `${i + 1}. *${p.title}* @ ${p.companyName}\n   ${p.region}\n   ${p.link}`;
  });
  return lines.join("\n\n");
}

function formatPositionsListWithLabel(
  positions: PositionForMessage[],
  label: string,
  count: number
): string {
  const header = [
    `📋 *${label}*`,
    `Total: ${count} position(s) from DB`,
    ``,
  ].join("\n");
  const body = formatPositionsBody(positions);
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
    try {
      const text = getNextNoPositionsMessage();
      await sendTextMessage(jid, text);
      return { sent: true, message: "Sent no-positions message." };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      return { sent: false, error };
    }
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

/**
 * Sends a given list of positions (e.g. from DB) to the given WhatsApp JID.
 * Used by the API for "last 12h" and other DB-backed sends.
 *
 * @param jid - WhatsApp ID (e.g. 5511999999999@s.whatsapp.net)
 * @param positions - List of positions (title, link, companyName, region)
 * @param label - Header label (e.g. "Last 12h open positions (DB)")
 */
export async function sendPositionsListToWhatsApp(
  jid: string,
  positions: PositionForMessage[],
  label: string
): Promise<SendOpenPositionsResult> {
  if (positions.length === 0) {
    try {
      const text = getNextNoPositionsMessage();
      await sendTextMessage(jid, text);
      return { sent: true, message: "Sent no-positions message." };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      return { sent: false, error };
    }
  }
  try {
    const text = formatPositionsListWithLabel(positions, label, positions.length);
    await sendTextMessage(jid, text);
    return { sent: true, message: `Sent ${positions.length} positions to ${jid}` };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { sent: false, error };
  }
}
