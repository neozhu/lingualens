import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Response } from "@/components/ai-elements/response";

export default function SceneDoc() {
  const t = useTranslations();
  const functionCode = `function createSystemInstructions(scene: Scene, locale: string): string {
  const targetLang = getLanguageNameByLocale(locale);

  // Core identity; scene directions set the priorities where they speak, otherwise use defaults.
  const identity = \`You are a professional AI assistant specialized in cross-language communication and task execution. When a scene gives directives, follow them first; otherwise apply the defaults below. Unless a scene changes it, keep all user-facing outputs in the target language inferred from the locale.\`;

  // Scene directives take highest priority where specified; they can reuse or replace defaults.
  const sceneBlock = scene ? \`
# SCENE DIRECTIVES (highest priority)
- Obey this scene above any defaults or system guidance for any instructions it specifies.
- Scene: \${scene.name_en}
\${scene.description}

\${scene.prompt}

---\` : '';

  // Fallback rules only apply when the scene is silent on a detail.
  const defaultDirection = targetLang === 'US English'
    ? 'Other languages → US English; US English → the requested target language (if specified); otherwise → US English'
    : \`\${targetLang} → US English; US English → \${targetLang}; otherwise → \${targetLang}\`;

  const fallbackRules = scene ? \`
# FALLBACK RULES (use only if the scene is silent)
- Primary output language: \${targetLang}
- Translation direction: \${defaultDirection}
- Output format: translation only, no explanations
- Preserve: formatting (Markdown/code/structure), line breaks, proper nouns
- Code handling: translate only comments and user-facing strings; keep identifiers intact\`
  : \`
# TRANSLATION TASK
- Primary output language: \${targetLang}
- Direction: \${defaultDirection}
- Output: translation only, no explanations or source text
- Fidelity: preserve formatting (Markdown/code/structure), speaker labels, and line breaks
- Code: translate comments and user-facing strings only; keep code/identifiers intact
- Terminology: natural, domain-appropriate wording; keep proper nouns unless widely localized\`;

  // Context
  const context = \`

## Context
- Target language (for user-facing outputs): \${targetLang}
- Locale: \${locale}\`;

  // When a scene exists, surface it first to reinforce precedence.
  return scene ? \`\${sceneBlock}\${identity}\${fallbackRules}\${context}\` : \`\${identity}\${fallbackRules}\${context}\`;
}`;
  
  return (
    <div className="max-w-3xl mx-auto p-6 motion-preset-fade-in motion-duration-700">
      <Card className="shadow-md motion-preset-slide-up motion-duration-500 motion-delay-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold motion-preset-fade-in motion-duration-500 motion-delay-300">{t('scene.systemPrompt')}</CardTitle>
          <CardDescription className="motion-preset-fade-in motion-duration-500 motion-delay-400">
            {t('scene.configInfo')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 motion-preset-fade-in motion-duration-500 motion-delay-500">   
          <div className="motion-preset-expand motion-duration-600 motion-delay-600">
            <Response className="motion-preset-fade-in motion-duration-500 motion-delay-700">
              {`\`\`\`typescript\n${functionCode}\n\`\`\``}
            </Response>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}