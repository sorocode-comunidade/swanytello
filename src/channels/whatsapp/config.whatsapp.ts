/**
 * WhatsApp (Baileys) channel configuration.
 * Load from environment variables. Uses getters so values are read at access time;
 * this ensures .env is applied even when this module is loaded before dotenv.config() in server.ts.
 * @module channels/whatsapp/config.whatsapp
 */

export const whatsappConfig = {
  /** Directory where Baileys stores auth state (creds + keys). */
  get authDir(): string {
    return process.env.WHATSAPP_AUTH_DIR ?? "auth_info_baileys";
  },
  /** Default JID to send open positions to when not provided in the request. */
  get targetJid(): string {
    return process.env.WHATSAPP_TARGET_JID ?? "";
  },
  /** JID used when body.to is explicitly empty string (e.g. group). */
  get groupId(): string {
    return process.env.WHATSAPP_GROUP_ID ?? "";
  },
  /** Whether to print QR code to terminal when connecting (first time or no session). */
  get printQRInTerminal(): boolean {
    return process.env.WHATSAPP_PRINT_QR !== "false";
  },
  /** Max time to wait for a send (ms). After this we stop waiting and return 504; app keeps running. */
  get sendTimeoutMs(): number {
    return Number(process.env.WHATSAPP_SEND_TIMEOUT_MS) || 30_000;
  },
};
