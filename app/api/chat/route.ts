import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { Scene } from "@/lib/scenes";
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { DEFAULT_MODEL, MODELS } from "@/lib/models";

export const maxDuration = 240;



function getLanguageNameByLocale(locale: string): string {
  const map: Record<string, string> = {
    zh: 'Simplified Chinese',
    en: 'US English',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    nl: 'Dutch',
    id: 'Indonesian',
    th: 'Thai',
    vi: 'Vietnamese',
    my: 'Burmese',
    ms: 'Malay',
    ja: 'Japanese',
  };
  return map[locale] || 'US English';
}

function createSystemInstructions(scene: Scene, locale: string): string {
  const userLang = getLanguageNameByLocale(locale);

  // Layer 1: Core Identity - WHO you are
  const identity = `You are a professional AI assistant specialized in cross-language communication and task execution.`;

  // Layer 2: Scene-Specific Instructions - PRIMARY rules (highest priority)
  const sceneBlock = scene ? `
# PRIMARY TASK (Scene: ${scene.name_en})
${scene.description}

${scene.prompt}

---` : '';

  // Layer 3: Fallback Rules - ONLY apply when scene doesn't specify
  const defaultDirection = userLang === 'US English'
    ? 'US English → Simplified Chinese; Simplified Chinese → US English; otherwise → Simplified Chinese'
    : `${userLang} → US English; US English → ${userLang}; otherwise → ${userLang}`;

  const fallbackRules = scene ? `
# FALLBACK RULES (only if scene doesn't specify)
- Translation direction: ${defaultDirection}
- Output format: translation only, no explanations
- Preserve: formatting (Markdown/code/structure), line breaks, proper nouns
- Code handling: translate only comments and user-facing strings; keep identifiers intact` 
  : `
# TRANSLATION TASK
- Direction: ${defaultDirection}
- Output: translation only, no explanations or source text
- Fidelity: preserve formatting (Markdown/code/structure), speaker labels, and line breaks
- Code: translate comments and user-facing strings only; keep code/identifiers intact
- Terminology: natural, domain-appropriate wording; keep proper nouns unless widely localized`;

  // Layer 4: Context
  const context = `

## Context
- User's native language: ${userLang}
- Locale: ${locale}`;

  return `${identity}${sceneBlock}${fallbackRules}${context}`;
}

function getModelProvider(model: string) {
  const modelConfig = MODELS.find(m => m.id === model);
  const provider = modelConfig?.provider || 'openai';

  switch (provider) {
    case 'gemini': return google(model);
    case 'openai': return openai(model);
    default: return openai(model);
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, model = DEFAULT_MODEL, scene, locale = 'en' } = body;
  // Toggle OpenAI reasoning via request body: `thinking` (true/false)
  const enableReasoning = body?.thinking === true;
  const systemPrompt = createSystemInstructions(scene, locale);
  const provider = getModelProvider(model);
  const lastMessages = messages.length > 4
    ? messages.slice(messages.length - 4)
    : messages;



  const result = streamText({
    model: provider,
    system: systemPrompt,
    abortSignal: req.signal,
    messages: convertToModelMessages((lastMessages as UIMessage[])),
    // Apply OpenAI reasoning settings when requested by client
    providerOptions: enableReasoning
      ? {
        openai: {
          reasoningEffort: 'medium',
          textVerbosity: 'medium'
        },
      }
      : {
        openai: {
          reasoningEffort: 'low',
          textVerbosity: 'low'
        },
      },
  });

  return result.toUIMessageStreamResponse({ sendReasoning: false });
}


