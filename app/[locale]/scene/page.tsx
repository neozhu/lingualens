import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SCENES } from '@/lib/scenes';
import { useTranslations, useLocale } from 'next-intl';

export default function SceneDoc() {
  const t = useTranslations();
  const locale = useLocale();
  const functionCode = `function createSystemPrompt(scene: Scene): string {
      // General translation instructions
      const baseInstructions = \`
    You are a highly reliable, professional translation assistant. Always identify the primary language of the input text based on comprehensive analysis of syntax, vocabulary, and linguistic patterns. Follow these strict rules:
    - If the input's primary language is Chinese, translate the entire content into US English.
    - If the input's primary language is not Chinese, translate the entire content into Simplified Chinese.
    - Output only the translated text. Do not include the original text, comments, explanations, or any unnecessary formatting, unless specifically required by the scenario.
    - Preserve important markdown, code, or structural formatting when present.
    - If a specific structure or style is required by the scenario, strictly follow those requirements.
    \`;
    
      // If no scene provided or invalid format, use general translation
      if (!scene || typeof scene === 'string' || !scene.name_en || !scene.description || !scene.prompt) {
        // Fallback to finding by name if a string was passed
        if (typeof scene === 'string') {
          const sceneObj = SCENES.find((s) => s.name === scene);
          if (sceneObj) {
            return \`
    \${baseInstructions}
    Context: \${sceneObj.name_en} - \${sceneObj.description}
    Special Instructions: \${sceneObj.prompt}
    
    Translate the following text according to these requirements:
    \`;
          }
        }
        
        return \`
    \${baseInstructions}
    Translate the following text according to these rules:
    \`;
      }`;
  return (
    <div className="max-w-3xl mx-auto p-6 bg-background">
      <h1 className="text-2xl font-bold mb-6">{t('scene.title')}</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{t('scene.systemPrompt')}</h2>
        <p className="mb-4 text-muted-foreground">
          {t('scene.promptDescription')}
        </p>
        <p className=" text-muted-foreground">
          {t('scene.configInfo')}
        </p>
        <pre className="px-4 py-5">
          <code className="relative block font-mono text-sm leading-normal whitespace-pre-wrap break-words" data-language="javascript">
            {functionCode}
          </code>
        </pre>
      </section>      <section>
        <h2 className="text-xl font-semibold mb-4">{t('scene.availableScenes')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SCENES.map((s) => (
            <Card key={s.name}>
              <CardContent className="space-y-3">
                <h3 className="text-lg font-medium">
                  {locale === 'en' ? s.name_en:s.name}
                </h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}