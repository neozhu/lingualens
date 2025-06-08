import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SceneDoc() {
  const t = useTranslations();
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
    <div className="max-w-3xl mx-auto p-6 motion-preset-fade-in motion-duration-700">
      <Card className="shadow-md motion-preset-slide-up motion-duration-500 motion-delay-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold motion-preset-fade-in motion-duration-500 motion-delay-300">{t('scene.systemPrompt')}</CardTitle>
          <CardDescription className="motion-preset-fade-in motion-duration-500 motion-delay-400">
            {t('scene.configInfo')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 motion-preset-fade-in motion-duration-500 motion-delay-500">   
          <div className="bg-slate-950 text-slate-50 dark:bg-slate-900 overflow-hidden rounded-md motion-preset-expand motion-duration-600 motion-delay-600">
            <div className="p-6">
              <pre className="font-mono text-sm leading-normal whitespace-pre-wrap break-words overflow-x-auto motion-preset-fade-in motion-duration-500 motion-delay-700">
                <code data-language="javascript">
                  {functionCode}
                </code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}