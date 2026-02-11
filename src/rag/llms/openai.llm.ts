import { ChatOpenAI } from "@langchain/openai";

const defaultModel = "gpt-4o-mini";

let openaiInstance: ChatOpenAI | null = null;

/**
 * Returns a shared ChatOpenAI instance configured from env.
 * Uses OPENAI_API_KEY (required) and OPENAI_MODEL (default gpt-4o-mini).
 */
/** Normalize env value: trim and remove common .env issues (newlines, carriage returns). */
function normalizeEnv(value: string | undefined): string {
  return value?.replace(/\r\n|\r|\n/g, "").trim() ?? "";
}

export function getOpenAIChat(): ChatOpenAI {
  if (!openaiInstance) {
    const apiKey = normalizeEnv(process.env.OPENAI_API_KEY);
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is required when using OpenAI. Set it in .env (no spaces around =) and ensure the app loads .env at startup."
      );
    }
    const model = normalizeEnv(process.env.OPENAI_MODEL) || defaultModel;
    openaiInstance = new ChatOpenAI({
      apiKey,
      model,
    });
  }
  return openaiInstance;
}
