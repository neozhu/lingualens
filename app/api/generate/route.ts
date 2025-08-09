"use server";

import { google } from "@ai-sdk/google";
import { GEMINI_MODEL_FLASH } from "@/lib/models";
import { streamText, convertToModelMessages, type UIMessage } from "ai";



// Use configured Gemini Flash model

/**
 * Generate translation prompt for a specific scene
 * @param req Request object
 */
export async function POST(req: Request) {
 
  const { messages } = await req.json();
  console.log(messages);
  // Build system prompt for generating translation instructions
  const systemPrompt = `
You are a senior prompt engineer. Create ONE ultra‑concise, scenario‑specific instruction for an AI translator using the scene name and description from the chat.

Rules:
- Max 400 characters.
- Output the prompt text only (no titles, quotes, examples, JSON, or code fences).
- Use plain Markdown; short bullet(s) allowed; no extra commentary.

What the prompt must cover (terse):
- Tone and formality appropriate to the scene.
- How to handle domain terminology and proper nouns.
- What formatting to preserve (markdown/code/structure).
- Language direction: if input is US English -> translate to Simplified Chinese; otherwise -> translate to US English.
- Any scene‑specific constraints.

Do not mention “scene”, “description”, or “this prompt”. Write as a direct instruction to the translator.
`;



  // Create Gemini model instance
  const provider = google(GEMINI_MODEL_FLASH); // Start the streaming process

  const result = streamText({
    model: provider,
    system: systemPrompt,
    messages: convertToModelMessages(messages as UIMessage[]),
    temperature: 0.3 // Balance creativity and precision
  });

  return result.toUIMessageStreamResponse({ sendReasoning: false });
}
