import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getRagProvider, getChatModel } from "../../../src/rag/llms/index.js";

const savedEnv: Record<string, string | undefined> = {};

function stashEnv(keys: string[]) {
  for (const k of keys) {
    savedEnv[k] = process.env[k];
  }
}

function restoreEnv(keys: string[]) {
  for (const k of keys) {
    if (savedEnv[k] !== undefined) process.env[k] = savedEnv[k];
    else delete process.env[k];
  }
}

const ENV_KEYS = ["RAG_LLM_PROVIDER", "OPENAI_API_KEY"];

describe("RAG LLM index (provider selection)", () => {
  beforeEach(() => {
    stashEnv(ENV_KEYS);
  });

  afterEach(() => {
    restoreEnv(ENV_KEYS);
  });

  describe("getRagProvider", () => {
    it("returns ollama-cloud when RAG_LLM_PROVIDER and OPENAI_API_KEY are unset (default)", () => {
      delete process.env.RAG_LLM_PROVIDER;
      delete process.env.OPENAI_API_KEY;
      expect(getRagProvider()).toBe("ollama-cloud");
    });

    it("returns openai when RAG_LLM_PROVIDER=openai", () => {
      process.env.RAG_LLM_PROVIDER = "openai";
      delete process.env.OPENAI_API_KEY;
      expect(getRagProvider()).toBe("openai");
    });

    it("returns openai when OPENAI_API_KEY is set and RAG_LLM_PROVIDER is unset", () => {
      delete process.env.RAG_LLM_PROVIDER;
      process.env.OPENAI_API_KEY = "sk-test";
      expect(getRagProvider()).toBe("openai");
    });

    it("returns ollama-cloud when RAG_LLM_PROVIDER=ollama-cloud", () => {
      process.env.RAG_LLM_PROVIDER = "ollama-cloud";
      expect(getRagProvider()).toBe("ollama-cloud");
    });

    it("normalizes RAG_LLM_PROVIDER to lowercase", () => {
      process.env.RAG_LLM_PROVIDER = "OLLAMA-CLOUD";
      expect(getRagProvider()).toBe("ollama-cloud");
    });
  });

  describe("getChatModel", () => {
    it("returns model with invoke when default (ollama-cloud)", () => {
      delete process.env.RAG_LLM_PROVIDER;
      delete process.env.OPENAI_API_KEY;
      const model = getChatModel();
      expect(model).toHaveProperty("invoke");
      expect(typeof model.invoke).toBe("function");
    });
  });
});
