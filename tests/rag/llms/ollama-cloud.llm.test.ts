import { describe, it, expect, vi, beforeEach } from "vitest";

const mockChat = vi.fn();

vi.mock("ollama", () => ({
  Ollama: vi.fn().mockImplementation(() => ({ chat: mockChat })),
}));

const { getOllamaCloudChat } = await import(
  "../../../src/rag/llms/ollama-cloud.llm.js"
);

describe("ollama-cloud.llm", () => {
  beforeEach(() => {
    mockChat.mockClear();
    mockChat.mockResolvedValue({
      message: { content: "Mocked cloud reply" },
    });
  });

  describe("getOllamaCloudChat", () => {
    it("returns an object with invoke function", () => {
      const chat = getOllamaCloudChat();
      expect(chat).toHaveProperty("invoke");
      expect(typeof chat.invoke).toBe("function");
    });

    it("invoke(message) calls client.chat with model and messages", async () => {
      const chat = getOllamaCloudChat();
      await chat.invoke("Hello!");

      expect(mockChat).toHaveBeenCalledTimes(1);
      const call = mockChat.mock.calls[0][0];
      expect(call).toHaveProperty("model");
      expect(typeof call.model).toBe("string");
      expect(call.messages).toEqual([{ role: "user", content: "Hello!" }]);
    });

    it("invoke(message) returns { content } from response.message.content", async () => {
      mockChat.mockResolvedValueOnce({
        message: { content: "Custom reply from cloud" },
      });
      const chat = getOllamaCloudChat();
      const result = await chat.invoke("Hi");

      expect(result).toEqual({ content: "Custom reply from cloud" });
    });

    it("invoke returns empty string when response.message.content is missing", async () => {
      mockChat.mockResolvedValueOnce({ message: {} });
      const chat = getOllamaCloudChat();
      const result = await chat.invoke("Hi");

      expect(result).toEqual({ content: "" });
    });
  });
});
