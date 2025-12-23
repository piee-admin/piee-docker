export type OpenModelPreset = {
  model: string;
  provider:
    | "openai"
    | "anthropic"
    | "google"
    | "meta"
    | "image"
    | "audio"
    | "custom";
  supportsAutoPaste: boolean;
  buildUrl: (prompt: string) => string;
};

export const OPEN_MODEL_PRESETS: Record<string, OpenModelPreset> = {
  // ---------------- OpenAI ----------------
  "gpt-4o": {
    model: "gpt-4o",
    provider: "openai",
    supportsAutoPaste: true,
    buildUrl: (prompt) =>
      `https://chat.openai.com/?prompt=${encodeURIComponent(prompt)}`,
  },

  "gpt-4.1": {
    model: "gpt-4.1",
    provider: "openai",
    supportsAutoPaste: true,
    buildUrl: (prompt) =>
      `https://chat.openai.com/?prompt=${encodeURIComponent(prompt)}`,
  },

  // ---------------- Anthropic ----------------
  "claude-3-opus": {
    model: "claude-3-opus",
    provider: "anthropic",
    supportsAutoPaste: false,
    buildUrl: () => "https://claude.ai/new",
  },

  // ---------------- Google ----------------
  "gemini-1.5-pro": {
    model: "gemini-1.5-pro",
    provider: "google",
    supportsAutoPaste: false,
    buildUrl: () => "https://gemini.google.com/app",
  },

  "gemini-1.5-flash": {
    model: "gemini-1.5-flash",
    provider: "google",
    supportsAutoPaste: false,
    buildUrl: () => "https://gemini.google.com/app",
  },

  // ---------------- Meta / OSS ----------------
  "llama-3-70b": {
    model: "llama-3-70b",
    provider: "meta",
    supportsAutoPaste: false,
    buildUrl: () => "https://huggingface.co/chat",
  },

  // ---------------- Image ----------------
  "midjourney": {
    model: "midjourney",
    provider: "image",
    supportsAutoPaste: false,
    buildUrl: () => "https://discord.com/channels/@me",
  },

  // ---------------- Custom ----------------
  "local-ollama": {
    model: "local-ollama",
    provider: "custom",
    supportsAutoPaste: false,
    buildUrl: () => "http://localhost:11434",
  },
};
