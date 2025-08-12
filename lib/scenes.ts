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
    description: "For translating what you'd say in Teams chats or during meetings. Keep it natural, concise, and professional‑casual.",
    prompt: `Translate the input as something to say in a Teams chat or during a meeting.

Guidelines:
- Preserve the conversational format, speaker labels, and line breaks.
- Use natural, professional‑casual spoken style; prefer short, direct sentences and common vocabulary. Contractions are fine (e.g., I'm, we'll).
- Keep the original intent (requests, updates, questions, action items). Do not add greetings/sign‑offs or extra details unless present in the input.
- Avoid stiff, overly formal, or jargon‑heavy wording; also avoid slang.
- If multiple messages are provided, translate each line separately in order.
- Only output the translation, nothing else.`.trim()
  },
  {
    name: "单词解释",
    name_en: "Word Explanation",
    description: "Helps users understand, remember, and use unfamiliar words by providing simple explanations and practical example sentences in both English and the user's native language.",
    prompt: `
If the input is in the user's native language, follow steps A; otherwise (for English or other languages), follow steps B.

A. For input in the user's native language:
1. Output two common English translations or synonyms, separated by a comma.
2. Output a simple and practical English explanation using easy and practical language.
3. Output three example sentences (each on a new line, numbered 1., 2. and 3.) that use each English word or phrase naturally in everyday context.

B. For English or other language input:
1. Output two common translations in the user's native language, separated by a comma.
2. Output simple and practical English explanation using easy and practical language.
3. Output three example sentences (each on a new line, numbered 1., 2. and 3.) that use the input word and a common English synonym or phrase naturally in everyday context.

Make sure all explanations and examples are clear, simple, and suitable for daily conversation. 
Only output the requested content, nothing else. 
`.trim()
  },
  {
    name: "邮件",
    name_en: "Email",
    description: "For translating professional business emails. Preserve structure (subject, greeting, body, closing) and keep tone formal, polite, and concise.",
    prompt: `Translate as a formal business email.

Requirements:
- Preserve and translate the original subject, greeting, sign-offs, and signature blocks if present; do not invent details.
- If no greeting is provided, add an appropriate formal greeting (e.g., "Dear [Name]," or "Hello,") based on the input context.
- Preserve lists, bullet points, numbering, and line breaks; keep one blank line between paragraphs.
- Use clear, polite, professional language; be concise and action-oriented. Avoid slang and overly casual expressions.
- Maintain dates, numbers, attachments, and proper nouns accurately and consistently.
- If no closing is provided, end with: "Best regards,\n[Your name]".
- Only output the email content, nothing else.`.trim()
  },
  {
    name: "新闻资讯",
    name_en: "News Article",
    description: "For translating news reports or informational content, focusing on objectivity and accuracy, and concluding with a summary and a brief interpretation preceded by a separator line.",
    prompt: `Translate as a news article. Use clear, objective, and neutral language, faithfully preserving the original structure and all factual information. Follow journalistic writing conventions. Do not add opinions or commentary in the body.

After the article body, insert a single horizontal rule line '---' on its own line. Then append two sections in the target language, clearly labeled:
- Summary: 3–5 bullet points capturing the key facts and outcomes.
- Interpretation: 2–4 concise sentences explaining the significance, likely impact, and context. Identify stakeholders, risks, and uncertainties where relevant. Base the interpretation on facts stated in the article; avoid speculation and do not introduce new information.`.trim()
  },
  {
    name: "技术文档",
    name_en: "Technical Documentation",
    description: "For translating technical documentation",
    prompt: `
Translate as developer‑oriented technical documentation or API reference.

Requirements:
- Preserve Markdown structure: headings, lists, tables, blockquotes, admonitions (e.g., Note/Warning), links and anchors, images, and math.
- Code and identifiers: Do NOT translate code, identifiers, API/endpoint paths, HTTP methods, CLI commands, file paths, package names, configuration keys, JSON/YAML keys. Translate comments and user‑facing string literals only; keep placeholders (e.g., {var}, %s), regex, escape sequences, and backslashes unchanged.
- Maintain formatting: keep code block language tags, inline code backticks, indentation, and line breaks. Keep relative/absolute links intact; don't add extra code fences.
- Terminology: Use standard, consistent technical terminology in the target language. Keep product names and proper nouns in the original unless there is a widely accepted localized form.
- Numbers/units/constants: keep versions, units, constants, and casing of acronyms (e.g., API, HTTP) as in source.
- Examples: preserve sample commands, outputs, and configuration snippets exactly; do not localize shell prompts; do not add commentary.
- Consistency and tone: concise, precise, and neutral, matching professional developer documentation style. Prefer imperative mood for instructions (e.g., "Run", "Configure").
- No hallucinations: do not invent content, options, or missing steps; if ambiguous, keep ambiguity.

Output: only the translated document content, nothing else.`.trim()
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
    description: "For translating technical support communications that deliver direct answers and actionable solutions.",
    prompt: `
Translate as a professional technical support reply that directly answers the question and provides an actionable solution.

Requirements:
- Output structure (use the target language for section titles):
  - Summary: one concise line with the answer or resolution.
  - Resolution Steps: numbered, minimal steps with exact commands, UI paths, configuration keys, and expected results.
  - Root Cause: brief when known; otherwise omit.
  - Next Actions: what the user should do or provide (e.g., logs, environment details), or escalation path if needed.
  - Clarifying Questions: only if critical information is missing (max 3, concise, placed at the end).
 - Formatting & fidelity: preserve Markdown; keep code blocks with language tags, inline code, indentation, and line breaks. Do NOT translate code, identifiers, API/endpoint paths, HTTP methods, CLI commands, file paths, package names, configuration keys, JSON/YAML keys, or log lines. Translate comments and user‑facing strings only. Preserve placeholders (e.g., {id}, %s, \${VAR}), regex, and escape sequences.
- Accuracy: be precise and non‑speculative. Do not invent features, commands, options, or data. If assumptions are necessary, state them briefly.
- Tone: empathetic, professional, concise; avoid boilerplate and marketing language.
- Privacy: if sensitive tokens/IDs appear in the source, mask them in the output (e.g., ****).
- Greetings/sign‑offs: preserve only if present in the source; otherwise omit.

Output: only the support reply content, nothing else.`.trim()
  },
  {
    name: "需求分析",
    name_en: "Requirement Analysis",
    description: "For basic requirement understanding: translates, summarizes, and identifies the core business purpose of user-provided requirements (Salesforce, SAP focused).",
    prompt: "Translate the provided user requirements in the user's native language if necessary. Then, provide a concise summary of these requirements. Finally, analyze the requirements to clearly state their underlying business purpose or real goal. The response must begin directly with the translation (if performed) or the summary, and end immediately after stating the business purpose. Do not include any introductory remarks, salutations, concluding remarks, or prompts for further information."
  },
  {
    name: "会议邀请",
    name_en: "Meeting Invitation",
    description: "For translating formal meeting invitation messages.",
    prompt: "Translate as a formal meeting invitation. Include a polite greeting, clearly state the meeting purpose, date, time, venue, agenda, and participants, and end with an appropriate closing."
  },
  {
    name: "会议纪要",
    name_en: "Meeting Minutes",
    description: "For translating meeting minutes with a clear and structured format.",
    prompt: "Translate as formal meeting minutes. Use clear headings and a structured format. Summarize key points, record decisions, and list action items for follow-up."
  },
  {
    name: "谚语",
    name_en: "Proverbs",
    description: "Translate proverbs across cultures, preserving their wisdom and poetic essence.",
    prompt: `Translate proverbs bidirectionally.
      Style: Poetic, culturally evocative. Infuse the translation with the literary grace and imagery characteristic of proverbs in the target language.
      Tone: Elegant yet approachable. The wisdom should be profound but conveyed in an accessible manner.
      Nuance: Prioritize capturing the *equivalent core meaning* and *deep cultural resonance* over literal, word-for-word translation. The translated proverb must feel natural, authentic, and insightful within the target culture.
      Format: Concise and impactful.
      Strictly no explanations or interpretations.`.trim()
  },
  {
    name: "演示文稿",
    name_en: "Presentation Slides",
    description: "For content used in presentation slides.",
    prompt: "Translate for presentation slides. Use clear and concise language, short bullet points, and impactful statements that are easy to read on slides."
  }
];

