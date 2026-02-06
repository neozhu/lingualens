import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { Scene } from "@/lib/scenes";
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { DEFAULT_MODEL, MODELS } from "@/lib/models";

export const maxDuration = 240;

function normalizeUiMessages(rawMessages: unknown[]): UIMessage[] {
  return rawMessages
    .filter((message): message is Record<string, unknown> => !!message && typeof message === "object")
    .map((message) => {
      const id =
        typeof message.id === "string" && message.id.length > 0
          ? message.id
          : `msg_${crypto.randomUUID()}`;
      const role =
        message.role === "system" || message.role === "assistant" || message.role === "user"
          ? message.role
          : "user";

      const sourceParts = Array.isArray(message.parts) ? message.parts : [];
      const normalizedParts = sourceParts
        .filter((part): part is Record<string, unknown> => !!part && typeof part === "object")
        .map((part) => {
          if (typeof part.type !== "string") {
            if (typeof part.text === "string") {
              return { type: "text", text: part.text };
            }
            return null;
          }

          if (part.type === "text") {
            return {
              ...part,
              text: typeof part.text === "string" ? part.text : "",
            };
          }

          if (part.type === "file") {
            const url =
              typeof part.url === "string"
                ? part.url
                : typeof part.data === "string"
                ? part.data
                : null;

            if (!url) return null;

            return {
              ...part,
              url,
              mediaType:
                typeof part.mediaType === "string"
                  ? part.mediaType
                  : typeof part.mimeType === "string"
                  ? part.mimeType
                  : "application/octet-stream",
            };
          }

          return part;
        })
        .filter((part): part is Record<string, unknown> => part !== null);

      if (normalizedParts.length > 0) {
        return {
          id,
          role,
          parts: normalizedParts as UIMessage["parts"],
        };
      }

      return {
        id,
        role,
        parts: [
          {
            type: "text",
            text: typeof message.content === "string" ? message.content : "",
          },
        ],
      };
    });
}



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
  const targetLang = getLanguageNameByLocale(locale);

  // Core identity; scene directions set the priorities where they speak, otherwise use defaults.
  const identity = `You are a professional AI assistant specialized in cross-language communication and task execution. When a scene gives directives, follow them first; otherwise apply the defaults below. Unless a scene changes it, keep all user-facing outputs in the target language inferred from the locale.`;

  // Scene directives take highest priority where specified; they can reuse or replace defaults.
  const sceneBlock = scene ? `
# SCENE DIRECTIVES (highest priority)
- Obey this scene above any defaults or system guidance for any instructions it specifies.
- Scene: ${scene.name_en}
${scene.description}

${scene.prompt}

---` : '';

  // Fallback rules only apply when the scene is silent on a detail.
  const defaultDirection = targetLang === 'US English'
    ? 'Other languages → US English; US English → the requested target language (if specified); otherwise → US English'
    : `${targetLang} → US English; US English → ${targetLang}; otherwise → ${targetLang}`;

  const fallbackRules = scene ? `
# FALLBACK RULES (use only if the scene is silent)
- Primary output language: ${targetLang}
- Translation direction: ${defaultDirection}
- Output format: translation only, no explanations
- Preserve: formatting (Markdown/code/structure), line breaks, proper nouns
- Code handling: translate only comments and user-facing strings; keep identifiers intact`
  : `
# TRANSLATION TASK
- Primary output language: ${targetLang}
- Direction: ${defaultDirection}
- Output: translation only, no explanations or source text
- Fidelity: preserve formatting (Markdown/code/structure), speaker labels, and line breaks
- Code: translate comments and user-facing strings only; keep code/identifiers intact
- Terminology: natural, domain-appropriate wording; keep proper nouns unless widely localized`;

  // Context
  const context = `

## Context
- Target language (for user-facing outputs): ${targetLang}
- Locale: ${locale}`;

  // When a scene exists, surface it first to reinforce precedence.
  return scene ? `${sceneBlock}${identity}${fallbackRules}${context}` : `${identity}${fallbackRules}${context}`;
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
  const safeMessages = Array.isArray(messages) ? normalizeUiMessages(messages) : [];
  const lastMessages = safeMessages.length > 5
    ? safeMessages.slice(safeMessages.length - 5)
    : safeMessages;



  const result = streamText({
    model: provider,
    system: systemPrompt,
    abortSignal: req.signal,
    messages: convertToModelMessages(lastMessages),
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


