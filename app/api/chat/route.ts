import { createGroq } from "@ai-sdk/groq"
import { streamText  } from "ai"
import { SCENES, Scene } from "@/lib/scenes";
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { QWEN_MODEL, DEFAULT_MODEL, MODELS } from "@/lib/models";

export const maxDuration = 30;

const groq = createGroq({
  fetch: async (url, options) => {
    if (options?.body) {
      const body = JSON.parse(options.body as string)
      if (body?.model === QWEN_MODEL) {
        body.reasoning_format = "parsed"
        options.body = JSON.stringify(body)
      }
    }
    return fetch(url, options)
  },
})

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
  const baseInstructions = `
The user's native language is ${inputLang}.
You are a highly reliable, professional translation assistant. Always identify the primary language of the input text based on comprehensive analysis of syntax, vocabulary, and linguistic patterns. Follow these strict rules:
- If the input's primary language is ${inputLang}, translate the entire content into ${inputLang=='US English' ? 'Simplified Chinese':'US English'}.
- If the input's primary language is not ${inputLang}, translate the entire content into ${inputLang}.
- Output only the translated text. Do not include the original text, comments, explanations, or any unnecessary formatting, unless specified by the scenario.
- Preserve important markdown, code, or structural formatting when present.
- If a specific structure or style is required by the scenario, strictly follow those requirements.
`;

  if (!scene || typeof scene === 'string' || !scene.name_en || !scene.description || !scene.prompt) {
    if (typeof scene === 'string') {
      const sceneObj = SCENES.find((s) => s.name === scene);
      if (sceneObj) {
        return `${baseInstructions}
Context: ${sceneObj.name_en} - ${sceneObj.description}
Special Instructions: ${sceneObj.prompt}

Translate the following text according to these requirements:`;
      }
    }
    return `${baseInstructions}
Translate the following text according to these rules:`;
  }

  return `${baseInstructions}
Context: ${scene.name_en} - ${scene.description}
Special Instructions: ${scene.prompt}

Translate the following text according to these requirements:`;
}

function getModelProvider(model: string) {
  const modelConfig = MODELS.find(m => m.id === model);
  const provider = modelConfig?.provider || 'groq';
  
  switch (provider) {
    case 'gemini': return google(model);
    case 'openai': return openai(model);
    default: return groq(model);
  }
}

export async function POST(req: Request) {
  const { messages, model = DEFAULT_MODEL, scene, locale = 'en' } = await req.json();
  const systemPrompt = createSystemInstructions(scene, locale);
  const provider = getModelProvider(model);
  
  const lastMessages = messages.length > 3 
    ? messages.slice(messages.length - 3) 
    : messages;
    
  const result = streamText({
    model: provider,
    system: systemPrompt,
    temperature: 0.3,
    messages: lastMessages,
  });
  
  return result.toDataStreamResponse();
}


