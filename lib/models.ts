// Model constants
export const QWEN_MODEL = "qwen-qwq-32b"
export const GEMINI_MODEL_FLASH = "gemini-2.5-flash"
export const GEMINI_MODEL_LITE = "gemini-2.5-flash-lite-preview-06-17"
export const GPT_4_MODEL = "gpt-4o-mini"
export const LLAMA_MODEL = "llama-3.3-70b-versatile"

// Default model
export const DEFAULT_MODEL = GEMINI_MODEL_FLASH;

// Model configuration with provider
export const MODELS = [
  { id: GEMINI_MODEL_FLASH, name: "Gemini 2.5 Flash", provider: "gemini" },
  { id: GEMINI_MODEL_LITE, name: "Gemini 2.5 Lite", provider: "gemini" },
  { id: LLAMA_MODEL, name: "Llama 3.3 70B", provider: "groq" },
  { id: QWEN_MODEL, name: "Qwen 32B", provider: "groq" },
  { id: GPT_4_MODEL, name: "GPT-4o Mini", provider: "openai" }
];