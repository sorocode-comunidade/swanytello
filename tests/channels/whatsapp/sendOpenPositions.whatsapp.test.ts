import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sendOpenPositionsToWhatsApp,
  type SendOpenPositionsResult,
} from "../../../src/channels/whatsapp/sendOpenPositions.whatsapp.js";

const mockGetLastRetrieved = vi.fn();
const mockSendTextMessage = vi.fn();

vi.mock("../../../src/etl/lastRetrievedStore.js", () => ({
  getLastRetrieved: (...args: unknown[]) => mockGetLastRetrieved(...args),
}));

vi.mock("../../../src/channels/whatsapp/client.whatsapp.js", () => ({
  sendTextMessage: (...args: unknown[]) => mockSendTextMessage(...args),
}));

describe("sendOpenPositions.whatsapp – sendOpenPositionsToWhatsApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns sent: false with message when no snapshot", async () => {
    mockGetLastRetrieved.mockReturnValue(null);

    const result = await sendOpenPositionsToWhatsApp("5511999999999@s.whatsapp.net");

    expect(result).toEqual<SendOpenPositionsResult>({
      sent: false,
      message: "No open positions available. Run ETL first (or wait for the next run).",
    });
    expect(mockSendTextMessage).not.toHaveBeenCalled();
  });

  it("returns sent: false with message when snapshot has empty positions", async () => {
    mockGetLastRetrieved.mockReturnValue({
      retrievedAt: "2025-02-13T12:00:00.000Z",
      extracted: 0,
      transformed: 0,
      created: 0,
      skipped: 0,
      positions: [],
    });

    const result = await sendOpenPositionsToWhatsApp("5511999999999@s.whatsapp.net");

    expect(result.sent).toBe(false);
    expect(result.message).toContain("No open positions");
    expect(mockSendTextMessage).not.toHaveBeenCalled();
  });

  it("calls sendTextMessage and returns sent: true when snapshot has positions", async () => {
    const snapshot = {
      retrievedAt: "2025-02-13T12:00:00.000Z",
      extracted: 2,
      transformed: 2,
      created: 1,
      skipped: 1,
      positions: [
        {
          title: "Dev Full Stack",
          link: "https://linkedin.com/jobs/1",
          companyName: "Acme",
          region: "Sorocaba",
        },
      ],
    };
    mockGetLastRetrieved.mockReturnValue(snapshot);
    mockSendTextMessage.mockResolvedValue(undefined);

    const result = await sendOpenPositionsToWhatsApp("5511999999999@s.whatsapp.net");

    expect(result).toEqual({
      sent: true,
      message: "Sent 1 positions to 5511999999999@s.whatsapp.net",
    });
    expect(mockSendTextMessage).toHaveBeenCalledTimes(1);
    const [jid, text] = mockSendTextMessage.mock.calls[0];
    expect(jid).toBe("5511999999999@s.whatsapp.net");
    expect(text).toContain("Últimas vagas");
    expect(text).toContain("Dev Full Stack");
    expect(text).toContain("Acme");
    expect(text).toContain("Sorocaba");
    expect(text).toContain("https://linkedin.com/jobs/1");
  });

  it("returns sent: false with error when sendTextMessage throws", async () => {
    const snapshot = {
      retrievedAt: "2025-02-13T12:00:00.000Z",
      extracted: 1,
      transformed: 1,
      created: 1,
      skipped: 0,
      positions: [
        {
          title: "Dev",
          link: "https://linkedin.com/jobs/1",
          companyName: "Acme",
          region: "SP",
        },
      ],
    };
    mockGetLastRetrieved.mockReturnValue(snapshot);
    mockSendTextMessage.mockRejectedValue(new Error("Connection timeout"));

    const result = await sendOpenPositionsToWhatsApp("5511999999999@s.whatsapp.net");

    expect(result).toEqual({
      sent: false,
      error: "Connection timeout",
    });
    expect(mockSendTextMessage).toHaveBeenCalledTimes(1);
  });
});
