import { describe, it, expect } from "vitest";
import { whatsappConfig } from "../../../src/channels/whatsapp/config.whatsapp.js";

describe("config.whatsapp – whatsappConfig", () => {
  it("exports config with authDir, targetJid, and printQRInTerminal", () => {
    expect(whatsappConfig).toHaveProperty("authDir");
    expect(whatsappConfig).toHaveProperty("targetJid");
    expect(whatsappConfig).toHaveProperty("printQRInTerminal");
    expect(typeof whatsappConfig.authDir).toBe("string");
    expect(typeof whatsappConfig.targetJid).toBe("string");
    expect(typeof whatsappConfig.printQRInTerminal).toBe("boolean");
  });

  it("uses default auth dir when WHATSAPP_AUTH_DIR is unset", () => {
    expect(whatsappConfig.authDir).toBe("auth_info_baileys");
  });
});
