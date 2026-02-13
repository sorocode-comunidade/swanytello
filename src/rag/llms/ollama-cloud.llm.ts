import { Ollama } from "ollama";

const defaultHost = "https://api.ollama.com";
const defaultModel = "glm-4.7-flash";

let ollamaCloudInstance: Ollama | null = null;
let configuredModel: string = defaultModel;

/**
 * Returns a shared Ollama client configured for Ollama Cloud (or custom host).
 * Uses OLLAMA_CLOUD_HOST (default https://api.ollama.com), OLLAMA_CLOUD_MODEL (default glm-4.7-flash),
 * and optional OLLAMA_API_KEY for Authorization header.
 */
function getOllamaCloudClient(): { client: Ollama; model: string } {
  if (!ollamaCloudInstance) {
    const host = process.env.OLLAMA_CLOUD_HOST ?? defaultHost;
    const model = process.env.OLLAMA_CLOUD_MODEL ?? defaultModel;
    const apiKey = process.env.OLLAMA_API_KEY?.trim();
    ollamaCloudInstance = new Ollama({
      host,
      headers:
        apiKey !== undefined && apiKey !== ""
          ? { Authorization: `Bearer ${apiKey}` }
          : undefined,
    });
    configuredModel = model;
  }
  return { client: ollamaCloudInstance, model: configuredModel };
}

export type OllamaCloudChat = {
  invoke: (message: string) => Promise<{ content: string }>;
};

/**
 * Returns a chat model that uses the official ollama package (cloud API).
 * Compatible with the RAG chain: invoke(message) returns { content: string }.
 *
 * Example usage from ollama package:
 *   const response = await ollama.chat({
 *     model: 'glm-4.7-flash',
 *     messages: [{ role: 'user', content: 'Hello!' }],
 *   })
 *   console.log(response.message.content)
 */
export function getOllamaCloudChat(): OllamaCloudChat {
  const { client, model } = getOllamaCloudClient();
  return {
    async invoke(message: string): Promise<{ content: string }> {
      const response = await client.chat({
        model,
        messages: [{ role: "user", content: message }],
      });
      const content = response.message?.content ?? "";
      return { content };
    },
  };
}
