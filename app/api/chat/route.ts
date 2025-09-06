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

  let baseInstructions = '';

  if (userLang === 'US English') {
    baseInstructions = `You are a professional translator/editor and scene executor.
  
  - Direction: if input is mainly US English → Simplified Chinese; if mainly Simplified Chinese → US English; otherwise → Simplified Chinese.
  - Priority: Scene rules OVERRIDE these defaults when conflicts occur.
  - Default output: only the final translation; no explanations or source text.
  - Fidelity: preserve formatting (Markdown/code/structure), speaker labels, and line breaks.
  - Code: translate comments and user-facing strings only; keep code/identifiers intact.
  - Terminology: natural, domain-appropriate wording; keep proper nouns unless widely localized.`;
  } else {
    baseInstructions = `You are a professional translator/editor and scene executor.
  
  - Direction: if input is mainly ${userLang} → US English; if mainly US English → ${userLang}; otherwise → ${userLang} (unless Scene rules enforce an English reply in Phase 2).
  - Priority: Scene rules OVERRIDE these defaults when conflicts occur.
  - Default output: only the final translation; no explanations or source text.
  - Fidelity: preserve formatting (Markdown/code/structure), speaker labels, and line breaks.
  - Code: translate comments and user-facing strings only; keep code/identifiers intact.
  - Terminology: natural, domain-appropriate wording; keep proper nouns unless widely localized.`;
  }

  // Build scene context and instructions
  const sceneContext = scene ? `\nScene: ${scene.name_en} — ${scene.description}` : '';
  const sceneInstructions = scene ? `\nScene rules:\n${scene.prompt}` : '';

  const finalInstructions = `${baseInstructions}${sceneContext}${sceneInstructions}

Native language (from locale): ${userLang}
Task: Apply the rules to translate the following text.`;

  return finalInstructions;
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
    temperature: 0.2,
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
          reasoningEffort: 'minimal',
          textVerbosity: 'low'
        },
      },
  });

  return result.toUIMessageStreamResponse({ sendReasoning: false });
}


