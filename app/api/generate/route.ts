"use server";

import { GPT_5_MINI_MODEL } from "@/lib/models";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";



// Use configured Gemini Flash model

/**
 * Optimize user-provided prompts (scene prompts) for clarity and cross-model compatibility.
 * @param req Request object
 */
export async function POST(req: Request) {
 
  const { messages } = await req.json();
  // System prompt for prompt-optimization (vendor-agnostic: OpenAI / Gemini / Anthropic)
  const systemPrompt = `
You are a senior prompt engineer. Rewrite the user's prompt into a clearer, more accurate, more robust prompt that works well across OpenAI, Google Gemini, and Anthropic models.

Input:
- Treat the latest user message as the "source prompt" to optimize. It may include a scene name/description and requirements.

Goal:
- Keep the user's intent and requirements, but remove ambiguity, add missing constraints, and make the instructions executable.
- Make it model-agnostic: avoid provider-specific syntax; avoid referencing hidden policies; write as universal instructions.

What to improve (when applicable):
- Role + objective: who the assistant is and what success looks like.
- Required inputs/assumptions: what information is provided vs missing.
- Output contract: exact output format, language, length/verbosity, and what NOT to include.
- Constraints: tone, formatting preservation, terminology/proper nouns, edge cases.
- Safety: if user asks for disallowed content, instruct the assistant to refuse briefly.

Output requirements (strict):
- Output ONLY the optimized prompt text (no preface, no analysis, no meta commentary).
- Use clean Markdown with short sections/headings if helpful.
- Do NOT mention "the user message", "the chat", or "this prompt".
`;


  const provider = openai(GPT_5_MINI_MODEL);

  const result = streamText({
    model: provider,
    system: systemPrompt,
    abortSignal: req.signal,
    messages: convertToModelMessages(messages as UIMessage[]),
    temperature: 0.3 // Balance creativity and precision
  });

  return result.toUIMessageStreamResponse({ sendReasoning: false });
}
