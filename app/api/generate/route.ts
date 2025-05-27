"use server";

import { google } from "@ai-sdk/google";
import { streamText } from "ai";



// Use Google Gemini 2.5 Flash Preview 05-20 model
const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";

/**
 * Generate translation prompt for a specific scene
 * @param req Request object
 */
export async function POST(req: Request) {
 
  const {messages } = await req.json();
  console.log(messages);
  // Build system prompt for generating translation instructions
  const systemPrompt = `
You are an expert prompt engineer. Your task is to generate a highly effective, scenario-specific translation prompt for AI models, based on the provided scene name and description. This prompt will guide accurate, context-aware translation for the given scenario.

Guidelines:
1. The prompt must be extremely concise—strictly no more than 400 characters.
2. Clearly specify the translation style, tone, and formality required for this scenario.
3. If relevant, mention how to handle domain-specific or specialized terminology.
4. State any format or structure that must be preserved in the translation.
5. Focus on the unique requirements of the provided scene.

Formatting:
- Use Markdown for clarity (bullet points if needed).
- Do NOT include JSON, code blocks, or any explanations outside the prompt itself.
- The response must be a single, well-formatted Markdown prompt, tailored to the scenario, and must not exceed 400 characters in total.
`;



  // Create Gemini model instance
  const provider = google(GEMINI_MODEL); // Start the streaming process

  const result = streamText({
    model: provider,
    system: systemPrompt,
    messages: messages,
    temperature: 0.3 // Balance creativity and precision
  });

  return result.toDataStreamResponse({ sendReasoning: false });
}
