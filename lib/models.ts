// Model constants

export const GEMINI_MODEL_FLASH = "gemini-3-flash-preview"
export const GEMINI_MODEL_LITE = "gemini-3.1-flash-lite-preview"
export const GPT_5_MINI_MODEL = "gpt-5.4-mini"
export const GPT_5_NANO_MODEL = "gpt-5.4-nano"

// Default model
export const DEFAULT_MODEL = GEMINI_MODEL_FLASH;

// Model configuration with provider
export const MODELS = [
  { id: GEMINI_MODEL_FLASH, name: "Gemini 3 Flash", provider: "gemini" },
  { id: GEMINI_MODEL_LITE, name: "Gemini 3.1 Lite", provider: "gemini" },
  { id: GPT_5_MINI_MODEL, name: "GPT-5 Mini", provider: "openai" },
  { id: GPT_5_NANO_MODEL, name: "GPT-5 Nano", provider: "openai" },
 
];