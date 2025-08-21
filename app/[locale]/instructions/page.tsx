import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Response } from "@/components/ai-elements/response";

export default function SceneDoc() {
  const t = useTranslations();
  const functionCode = `function createSystemInstructions(scene: Scene, locale: string): string {
  const inputLang = getLanguageNameByLocale(locale);
  const targetLang = inputLang === 'US English' ? 'Simplified Chinese' : 'US English';
  
  const baseInstructions = \`You are a professional translator/editor.

- Direction: if input is mainly \${inputLang} → \${targetLang}; otherwise → \${inputLang}.
- Priority: Scene rules OVERRIDE these defaults when conflicts occur.
- Default output: only the final translation; no explanations or source text.
- Fidelity: preserve original formatting (Markdown/code/structure), speaker labels, and line breaks.
- Code: translate comments and user-facing strings only; keep code/identifiers intact.
- Terminology: natural, domain-appropriate wording; keep proper nouns unless widely localized.
- Scene rules below may refine or override these defaults.\`;

  // Build scene context and instructions
  const sceneContext = scene ? \`\\nScene: \${scene.name_en} — \${scene.description}\` : '';
  const sceneInstructions = scene ? \`\\nScene rules:\\n\${scene.prompt}\` : '';

  const finalInstructions = \`\${baseInstructions}\${sceneContext}\${sceneInstructions}
Native language (from locale): \${userLang}
Task: Apply the rules to translate the following text.\`;

  return finalInstructions;
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