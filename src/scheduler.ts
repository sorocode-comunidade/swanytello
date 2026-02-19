/**
 * App scheduler: runs ETL then sends new open positions to WhatsApp every 6 hours.
 * Runs once on startup (after server listen) and then every 6h. Only one run at a time.
 */

import { runLinkedInEtlProcess, ETL_INTERVAL_MS } from "./etl/process/etl.process.js";
import { sendOpenPositionsLastHoursToWhatsApp } from "./api/services/whatsapp.service.js";
import { whatsappConfig } from "./channels/whatsapp/config.whatsapp.js";

const WHATSAPP_HOURS = 6;

let isRunning = false;

function resolveWhatsAppJid(): string {
  const groupId = whatsappConfig.groupId.trim();
  const targetJid = whatsappConfig.targetJid.trim();
  if (groupId) return groupId;
  if (targetJid) return targetJid;
  return "";
}

async function runScheduledJob(): Promise<void> {
  if (isRunning) {
    console.warn("[Scheduler] Previous run still in progress, skipping this tick.");
    return;
  }
  isRunning = true;
  try {
    const etlResult = await runLinkedInEtlProcess();
    if (etlResult.error) {
      console.warn("[Scheduler] ETL failed:", etlResult.error);
    } else {
      console.log(
        `[Scheduler] ETL done: extracted=${etlResult.extracted} created=${etlResult.created} skipped=${etlResult.skipped}`
      );
    }

    const jid = resolveWhatsAppJid();
    if (!jid) {
      console.log("[Scheduler] No WHATSAPP_GROUP_ID or WHATSAPP_TARGET_JID set, skipping WhatsApp send.");
    } else {
      const result = await sendOpenPositionsLastHoursToWhatsApp(jid, WHATSAPP_HOURS);
      if (result.sent) {
        console.log("[Scheduler] WhatsApp send OK:", result.message ?? "sent");
      } else {
        console.warn("[Scheduler] WhatsApp send failed:", result.error ?? result.message);
      }
    }
  } catch (err) {
    console.warn("[Scheduler] Error:", err);
  } finally {
    isRunning = false;
  }
}

/**
 * Starts the scheduled job: runs ETL then sends last 6h open positions to WhatsApp.
 * Runs once immediately (non-blocking) and then every 6 hours.
 * Call once from server startup after listen.
 */
export function startScheduledJobs(): void {
  runScheduledJob();
  setInterval(runScheduledJob, ETL_INTERVAL_MS);
}
