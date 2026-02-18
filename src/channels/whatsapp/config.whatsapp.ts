/**
 * WhatsApp (Baileys) channel configuration.
 * Load from environment variables.
 * @module channels/whatsapp/config.whatsapp
 */

const AUTH_DIR = process.env.WHATSAPP_AUTH_DIR ?? "auth_info_baileys";
const TARGET_JID = process.env.WHATSAPP_TARGET_JID ?? ""; // e.g. 5511999999999@s.whatsapp.net
const GROUP_ID = process.env.WHATSAPP_GROUP_ID ?? ""; // e.g. 120363123456789012@g.us (used when body.to is "")
const PRINT_QR = process.env.WHATSAPP_PRINT_QR !== "false";
const SEND_TIMEOUT_MS = Number(process.env.WHATSAPP_SEND_TIMEOUT_MS) || 30_000;

export const whatsappConfig = {
  /** Directory where Baileys stores auth state (creds + keys). */
  authDir: AUTH_DIR,
  /** Default JID to send open positions to when not provided in the request. */
  targetJid: TARGET_JID,
  /** JID used when body.to is explicitly empty string (e.g. group). */
  groupId: GROUP_ID,
  /** Whether to print QR code to terminal when connecting (first time or no session). */
  printQRInTerminal: PRINT_QR,
  /** Max time to wait for a send (ms). After this we stop waiting and return 504; app keeps running. */
  sendTimeoutMs: SEND_TIMEOUT_MS,
};
