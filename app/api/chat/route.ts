import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { SCENES, Scene } from "@/lib/scenes";
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { DEFAULT_MODEL, MODELS } from "@/lib/models";

export const maxDuration = 30;



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
  return map[locale] || 'English';
}

function createSystemInstructions(scene: Scene, locale: string): string {
  const inputLang = getLanguageNameByLocale(locale);
  const targetLang = inputLang === 'US English' ? 'Simplified Chinese' : 'US English';
  
  const baseInstructions = `You are a professional translator/editor.

- Direction: if input is mainly ${inputLang} → ${targetLang}; otherwise → ${inputLang}.
- Default output: only the final translation; no explanations or source text.
- Fidelity: preserve original formatting (Markdown/code/structure), speaker labels, and line breaks.
- Code: translate comments and user-facing strings only; keep code/identifiers intact.
- Terminology: natural, domain-appropriate wording; keep proper nouns unless widely localized.
- Scene rules below may refine or override these defaults.`;

  // 处理场景上下文
  let sceneContext = '';
  let sceneInstructions = '';
  
  if (scene && typeof scene === 'object' && scene.name_en && scene.description && scene.prompt) {
    sceneContext = `\nScene: ${scene.name_en} — ${scene.description}`;
    sceneInstructions = `\nScene rules:\n${scene.prompt}`;
  } else if (typeof scene === 'string') {
    const sceneObj = SCENES.find((s) => s.name === scene);
    if (sceneObj) {
      sceneContext = `\nScene: ${sceneObj.name_en} — ${sceneObj.description}`;
      sceneInstructions = `\nScene rules:\n${sceneObj.prompt}`;
    }
  }

  const finalInstructions = `${baseInstructions}${sceneContext}${sceneInstructions}

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
  const lastMessages = messages.length > 3 
    ? messages.slice(messages.length - 3) 
    : messages;
    
  const result = streamText({
    model: provider,
    system: systemPrompt,
    temperature: 0.3,
    messages: convertToModelMessages((lastMessages as UIMessage[])),
    // Apply OpenAI reasoning settings when requested by client
    providerOptions: enableReasoning
      ? {
          openai: {
            reasoningEffort: 'medium',
          },
        }
      : {
        openai: {
          reasoningEffort: 'minimal',
        },
      },
  });
  
  return result.toUIMessageStreamResponse();
}


