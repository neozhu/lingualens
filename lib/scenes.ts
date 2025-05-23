// lib/scenes.ts
export interface Scene {
  /** Scene name in Chinese */
  name: string;
  /** Scene name in English */
  name_en: string;
  /** Scene description */
  description: string;
  /** Generation prompt */
  prompt: string;
}

export const SCENES: Scene[] = [
  {
    name: "日常沟通",
    name_en: "Daily Communication",
    description: "Casual, friendly exchanges between colleagues or friends, using common vocabulary and simple grammar.",
    prompt: "Translate the input as a daily, casual conversation suitable for colleagues or friends, using common vocabulary, simple grammar, and a friendly tone. Ensure the result sounds natural, like what a native speaker would say in a relaxed setting. Avoid formal, stiff, or overly technical expressions. Only use casual and commonly used words."
  },
  {
    name: "单词解释",
    name_en: "Word Explanation",
    description: "Helps users understand, remember, and use unfamiliar words by providing simple explanations and practical example sentences in both English and Chinese.",
    prompt: `
If the input is in Chinese, follow steps A; otherwise (for English or other languages), follow steps B.

A. For Chinese input:
1. Output two common English translations or synonyms, separated by a comma.
2. Output a simple and practical English explanation using easy and practical language.
3. Output three example sentences (each on a new line, numbered 1., 2. and 3.) that use each English word or phrase naturally in everyday context.

B. For English or other language input:
1. Output two common Chinese translations, separated by a comma.
2. Output simple and practical English explanation using easy and practical language.
3. Output three example sentences (each on a new line, numbered 1., 2. and 3.) that use the input word and a common English synonym or phrase naturally in everyday context.

Make sure all explanations and examples are clear, simple, and suitable for daily conversation. 
Only output the requested content, nothing else. 
`.trim()
  },
  {
    name: "邮件",
    name_en: "Email",
    description: "For professional business email communication.",
    prompt: "Translate as a formal business email, starting with a suitable greeting and ending with the closing: 'Best regards,\\n[Your name]'. Use clear, polite, and professional language throughout. Ensure the translation accurately reflects the original meaning, maintains a respectful and professional tone, and keeps the structure and formatting appropriate for business communication. Leave a blank line between paragraphs."
  },
  {
    name: "新闻资讯",
    name_en: "News Article",
    description: "For translating news reports or informational content, focusing on objectivity and accuracy.",
    prompt: "Translate as a news article. Use clear, objective, and neutral language, faithfully preserving the original structure and all factual information. Follow journalistic writing conventions. Do not add opinions or commentary."
  },
  {
    name: "谚语",
    name_en: "Proverbs",
    description: "Translate proverbs across cultures, preserving their wisdom and poetic essence.",
    prompt: `**Translate proverbs bidirectionally.**
      **Style:** Poetic, culturally evocative.
      **Tone:** Elegant yet approachable.
      **Nuance:** Capture equivalent meaning over literal wording; maintain cultural depth.
      **Format:** Concise and impactful.\n**Strictly no explanations or interpretations.**`.trim()
  },
  {
    name: "技术文档",
    name_en: "Technical Documentation",
    description: "For translating technical documentation",
    prompt: "Translate as developer-oriented technical documentation or API reference. Use clear, concise, and professional language throughout. Ensure all technical terms and code elements are translated accurately and consistently. Preserve the logical structure and formatting suitable for developer reference."
  },
  {
    name: "社交媒体帖子",
    name_en: "Social Media Post (X/Reddit)",
    description: "For translating engaging posts for X (Twitter) or Reddit.",
    prompt: "Translate the input content as a social media post for X or Reddit. Keep the translation concise and engaging, using appropriate hashtags, emojis, and formatting. Do not answer questions or provide solutions—only translate the original content."
  },
  {
    name: "技术支持",
    name_en: "Technical Support",
    description: "For translating technical support communication in systems like TOPdesk.",
    prompt: "Translate as technical support communication for systems like TOPdesk, focusing on Salesforce, JavaScript, .NET, or SAP. Use clear, concise, and solution-focused language with a professional and approachable tone. include a greeting or closing; address the issue or request directly."
  },
  {
    name: "会议邀请",
    name_en: "Meeting Invitation",
    description: "For translating formal meeting invitation messages.",
    prompt: "Translate as a formal meeting invitation. Include a polite greeting, clearly state the meeting purpose, date, time, venue, agenda, and participants, and end with an appropriate closing."
  },
  {
    name: "讨论需求",
    name_en: "Requirement Discussion",
    description: "For discussions about requirements or gathering user needs, mainly for Salesforce, JavaScript, .NET, and SAP.",
    prompt: "Translate as a requirements discussion, mainly related to Salesforce, JavaScript, .NET, or SAP. Be detailed and encourage clarification or more information."
  },
  {
    name: "会议纪要",
    name_en: "Meeting Minutes",
    description: "For translating meeting minutes with a clear and structured format.",
    prompt: "Translate as formal meeting minutes. Use clear headings and a structured format. Summarize key points, record decisions, and list action items for follow-up."
  },
  {
    name: "演示文稿",
    name_en: "Presentation Slides",
    description: "For content used in presentation slides.",
    prompt: "Translate for presentation slides. Use clear and concise language, short bullet points, and impactful statements that are easy to read on slides."
  }
];

