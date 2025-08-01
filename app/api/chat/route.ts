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
  const targetLang = inputLang === 'US English' ? 'Simplified Chinese' : 'US English';
  
  const baseInstructions = `
## Role
You are an expert professional translator specializing in high-quality, contextually accurate translations.

## User Context
- User's native language: ${inputLang}
- Primary translation direction: ${inputLang} ↔ ${targetLang}

## Core Translation Rules
1. **Language Detection & Direction**:
   - If input is primarily in ${inputLang} → Translate to ${targetLang}
   - If input is primarily in any other language → Translate to ${inputLang}
   - Use comprehensive linguistic analysis (syntax, vocabulary, script, context) for detection

2. **Translation Quality Standards**:
   - Maintain natural, fluent expression in target language
   - Preserve original meaning, tone, and intent
   - Adapt cultural references and idioms appropriately
   - Use professional, contextually appropriate terminology
   - Consider the specific scenario context for optimal word choice

3. **Output Format**:
   - Provide ONLY the final translation
   - NO original text, explanations, or meta-commentary
   - Preserve all formatting (markdown, code blocks, structure)
   - Maintain consistent style throughout

4. **Special Handling**:
   - Code: Translate comments/strings only, preserve syntax
   - Mixed language: Translate each part to appropriate target
   - Technical terms: Use standard industry terminology
   - Proper nouns: Keep original unless commonly translated`;

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


