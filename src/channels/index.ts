export {
  sendOpenPositionsToWhatsApp,
  sendPositionsListToWhatsApp,
} from "./whatsapp/sendOpenPositions.whatsapp.js";
export { connect as connectWhatsApp, getSocket as getWhatsAppSocket } from "./whatsapp/client.whatsapp.js";
export { whatsappConfig } from "./whatsapp/config.whatsapp.js";
