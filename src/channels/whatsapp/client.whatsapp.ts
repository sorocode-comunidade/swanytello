/**
 * WhatsApp client using Baileys (socket-based WhatsApp Web API).
 * Connects with QR or saved session; exposes sendMessage for outbound messages.
 * QR is shown via connection.update (printQRInTerminal is deprecated in Baileys).
 * @module channels/whatsapp/client.whatsapp
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { createRequire } from "node:module";
import { whatsappConfig } from "./config.whatsapp.js";

// Baileys deprecated printQRInTerminal; we listen to connection.update and render the QR ourselves.
// qrcode-terminal turns the QR string from Baileys into a scannable ASCII QR in the terminal (no browser needed).
const require = createRequire(import.meta.url);
const qrcodeTerminal = require("qrcode-terminal") as { generate: (input: string, opts?: { small?: boolean }) => void };

let sock: WASocket | null = null;
let connecting = false;

/**
 * Ensures the socket is connected. If not, starts the connection (auth from config dir).
 * On first run, a QR code is shown in the terminal (or set WHATSAPP_PRINT_QR=false).
 */
async function ensureConnected(): Promise<WASocket> {
  if (sock) return sock;
  if (connecting) {
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (sock) return sock;
    }
    throw new Error("WhatsApp connection timeout");
  }

  connecting = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(
      whatsappConfig.authDir
    );

    const socket = makeWASocket({
      auth: state,
    });

    socket.ev.on("connection.update", (update) => {
      if (update.qr != null && whatsappConfig.printQRInTerminal) {
        console.log("\n[WhatsApp] Scan the QR code below with your phone:\n");
        qrcodeTerminal.generate(update.qr, { small: true });
      }
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        if (!shouldReconnect) {
          sock = null;
        }
        if (statusCode === DisconnectReason.loggedOut) {
          console.warn("[WhatsApp] Logged out. Scan QR again to reconnect.");
        } else if (shouldReconnect) {
          console.warn("[WhatsApp] Connection closed, reconnecting...");
          sock = null;
          ensureConnected().catch(console.error);
        }
      } else if (connection === "open") {
        console.log("[WhatsApp] Connected.");
      }
    });

    socket.ev.on("creds.update", saveCreds);

    sock = socket;
    return socket;
  } finally {
    connecting = false;
  }
}

/**
 * Returns the current socket if connected, otherwise null.
 * Does not trigger a connection.
 */
export function getSocket(): WASocket | null {
  return sock;
}

/**
 * Connects to WhatsApp if not already connected, then returns the socket.
 * Call this before sending messages (e.g. from the API) so the client is ready.
 */
export async function connect(): Promise<WASocket> {
  return ensureConnected();
}

/**
 * Wraps a promise in a timeout. If the promise does not settle within ms, rejects with an error (message contains "timeout" so API returns 504).
 * The original operation may still complete in the background; we just stop waiting.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Send timeout: message not delivered within ${ms / 1000}s`));
    }, ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Sends a text message to the given JID.
 * JID format: 5511999999999@s.whatsapp.net (no + or spaces).
 * Abandons the wait after sendTimeoutMs (default 30s); the app keeps running and the caller gets a timeout error (504).
 *
 * @param jid - WhatsApp ID (e.g. 5511999999999@s.whatsapp.net or group id)
 * @param text - Plain text message
 */
export async function sendTextMessage(
  jid: string,
  text: string
): Promise<void> {
  const socket = await ensureConnected();
  await withTimeout(
    socket.sendMessage(jid, { text }),
    whatsappConfig.sendTimeoutMs
  );
}
