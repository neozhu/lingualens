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
  
  const baseInstructions = `
You are a professional translator.

- Language & direction:
  - If the input is mainly ${inputLang} → translate to ${targetLang}
  - Otherwise → translate to ${inputLang}
- Output: Only the final translation. No explanations or original text. Preserve existing formatting (markdown/code/structure).
- Quality: Natural, faithful, and context-aware. Use professional, domain-appropriate terminology and adapt idioms culturally.
- Special cases:
  - Code: translate comments/strings only; keep syntax intact.
  - Mixed language: translate each part to the appropriate target.
  - Technical terms: use standard industry terms.
  - Proper nouns: keep original unless widely localized`;

  // 处理场景上下文
  let sceneContext = '';
  let sceneInstructions = '';
  
  if (scene && typeof scene === 'object' && scene.name_en && scene.description && scene.prompt) {
    sceneContext = `

## Scenario Context
- **Scenario**: ${scene.name_en}
- **Description**: ${scene.description}
- **Domain**: This translation is for ${scene.name_en.toLowerCase()} context
- **Target Audience**: Users in ${scene.name_en.toLowerCase()} scenarios`;

    sceneInstructions = `

## Scenario-Specific Instructions
${scene.prompt}

**Additional Context Considerations**:
- Adapt terminology to ${scene.name_en.toLowerCase()} domain standards
- Ensure translations are appropriate for this specific use case
- Maintain consistency with ${scene.name_en.toLowerCase()} conventions`;
  } else if (typeof scene === 'string') {
    const sceneObj = SCENES.find((s) => s.name === scene);
    if (sceneObj) {
      sceneContext = `

## Scenario Context
- **Scenario**: ${sceneObj.name_en}
- **Description**: ${sceneObj.description}
- **Domain**: This translation is for ${sceneObj.name_en.toLowerCase()} context
- **Target Audience**: Users in ${sceneObj.name_en.toLowerCase()} scenarios`;

      sceneInstructions = `

## Scenario-Specific Instructions
${sceneObj.prompt}

**Additional Context Considerations**:
- Adapt terminology to ${sceneObj.name_en.toLowerCase()} domain standards
- Ensure translations are appropriate for this specific use case
- Maintain consistency with ${sceneObj.name_en.toLowerCase()} conventions`;
    }
  }

  const finalInstructions = `${baseInstructions}${sceneContext}${sceneInstructions}

## Task
Translate the following text according to all above requirements:`;

  return finalInstructions;
}

function getModelProvider(model: string) {
  const modelConfig = MODELS.find(m => m.id === model);
  const provider = modelConfig?.provider || 'groq';
  
  switch (provider) {
    case 'gemini': return google(model);
    case 'openai': return openai(model);
    default: return openai(model);
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
    messages: convertToModelMessages((lastMessages as UIMessage[])),
  });
  
  return result.toUIMessageStreamResponse();
}


