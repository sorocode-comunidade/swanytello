/**
 * WhatsApp service – DB-backed send operations.
 * All database access (e.g. open_position model) happens here; routes only call this service.
 */

import { getOpenPositionsCreatedInLastHours } from "../../db_operations/models/open_position.model.js";
import {
  sendPositionsListToWhatsApp,
  type SendOpenPositionsResult,
} from "../../channels/whatsapp/sendOpenPositions.whatsapp.js";

const LAST_12H_LABEL = "Last 12h open positions (DB)";

/**
 * Fetches open positions created in the last 12 hours from the DB and sends them to the given WhatsApp JID.
 * Used by POST /api/whatsapp/send-open-positions-last-12h.
 *
 * @param jid - WhatsApp ID (e.g. 5511999999999@s.whatsapp.net or group JID)
 * @returns Result with sent flag and message or error
 */
export async function sendLast12hOpenPositionsToWhatsApp(
  jid: string
): Promise<SendOpenPositionsResult> {
  const positions = await getOpenPositionsCreatedInLastHours(12);
  const list = positions
    .filter((p): p is NonNullable<typeof p> => p != null)
    .map((p) => ({
      title: p.title,
      link: p.link,
      companyName: p.companyName,
      region: p.region,
    }));
  return sendPositionsListToWhatsApp(jid, list, LAST_12H_LABEL);
}
