import { ChatOpenAI } from "@langchain/openai";

const defaultModel = "gpt-4o-mini";

let openaiInstance: ChatOpenAI | null = null;

/**
 * Returns a shared ChatOpenAI instance configured from env.
 * Uses OPENAI_API_KEY (required) and OPENAI_MODEL (default gpt-4o-mini).
 */
export function getOpenAIChat(): ChatOpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is required when using OpenAI. Set it in .env or the environment."
      );
    }
    const model = process.env.OPENAI_MODEL ?? defaultModel;
    openaiInstance = new ChatOpenAI({
      apiKey,
      model,
    });
  }
  return openaiInstance;
}
