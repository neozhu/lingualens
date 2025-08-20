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
    prompt: `Translate for Teams chat/meetings.

- Keep speaker labels and line breaks.
- Natural, concise, professional‑casual; short, direct sentences (contractions ok).
- Preserve intent (requests/updates/questions/action items); do not add greetings/sign‑offs.
- Avoid stiff jargon and slang.
- If multiple lines, translate each line separately in order.`.trim()
  },
  {
    name: "单词解释",
    name_en: "Word Explanation",
    description: "Helps users understand, remember, and use unfamiliar words by providing simple explanations and practical example sentences in both English and the user's native language.",
    prompt: `Word learning helper. Keep output compact.

General:
- Use everyday, high‑frequency vocabulary (CEFR A2–B1). Avoid rare/academic words.
- Short, natural sentences. Examples 8–14 words.
- Show varied common patterns across the three examples (e.g., simple statement; common collocation/set phrase; negative or question). No extra labels/IPA.

If input is in the user's native language → A; otherwise (English/other) → B.

A. Native‑language input:
1) Two common English translations/synonyms (comma‑separated).
2) Simple English explanation (1–2 short sentences), mention part of speech and common pattern/preposition if relevant.
3) Three numbered example sentences (1., 2., 3.).

B. English/other input:
1) Two common translations in the user's native language (comma‑separated).
2) Simple English explanation (1–2 short sentences), mention part of speech/pattern if relevant.
3) Three numbered example sentences using the input together with a common English synonym/phrase, showing varied patterns.`.trim()
  },
  {
    name: "邮件",
    name_en: "Email",
    description: "For translating professional business emails. Preserve structure (subject, greeting, body, closing) and keep tone formal, polite, and concise.",
    prompt: `Formal business email.

- Preserve subject, greeting, sign‑offs, and signature blocks; do not invent details.
- If no greeting, add an appropriate one (e.g., "Dear [Name]," or "Hello,") per context.
- Preserve lists/numbering; one blank line between paragraphs.
- Clear, polite, professional; concise and action‑oriented.
- Keep dates, numbers, attachments, and proper nouns accurate.
- If no closing, end with: "Best regards,\n[Your name]".`.trim()
  },
  {
    name: "新闻资讯",
    name_en: "News Article",
    description: "For translating news reports or informational content, focusing on objectivity and accuracy, and concluding with a summary and a brief interpretation preceded by a separator line.",
    prompt: `News report style.

- Objective, neutral; preserve structure and facts; no opinion in the body.
- After the body add a line with '---'. Then append two sections with subheadings:
  - '### Summary' — 3–5 bullet points of key facts/outcomes.
  - '### Interpretation' — 2–4 sentences on significance/impact/context, based only on article facts (no speculation).`.trim()
  },
  {
    name: "技术支持",
    name_en: "Technical Support",
    description: "Two‑phase workflow: translate foreign‑language TOPdesk tickets into your native language (from locale); then turn your native‑language solution into a concise English reply with actionable steps.",
    prompt: `Two‑phase technical support assistant.

Detection:
- Decide phase based only on the current user message; ignore earlier turns unless explicit overrides are present.
- Ticket-like content → Phase 1 (translate): presence of "Details" labels, ticket metadata headers (e.g., reporter name/date/time lines), message headers (e.g., subject/to/date fields), separators, or mixed-language blocks.
- Otherwise, if the text is in the native language (from locale) and reads like a solution (imperatives, numbered steps, troubleshooting notes, confirmations), use Phase 2 (English reply).
- Otherwise fall back to language check: if input language differs from native language (from locale) → Phase 1; if it matches → Phase 2.

Phase 1 — Ticket translation (to native language):
- Translate the ticket content into the native language (from locale). Do not invent solutions.
- Preserve structure, headings, lists, and line breaks; no added commentary.
- Keep URLs unchanged; do not split blocks on a lone URL line — treat it as part of the nearest related block.
- Keep error messages/log lines unchanged.
- Keep code/identifiers/endpoints/HTTP methods/CLI/file paths/package names/config keys/JSON‑YAML keys/log lines in original; translate only user‑facing text.
- Preserve header labels and ticket metadata: keep ticket metadata headers (reporter name/date/time and Details) as-is; if embedded message headers are present (e.g., subject/to/date fields), keep their labels. Translate body greetings and sign-offs into the native language.

Phase 2 — English reply draft (for TOPdesk):
- Output in English, regardless of target locale.
 - Start with greeting: "Hi [Name]," (use provided name; if unknown, use "Hi there,").
 - Body: reply exactly according to the user's intended solution/answer; keep it simple and actionable. Use short paragraphs; add a brief bullet list only when listing steps or options. Do not add headings/sections unless explicitly requested.
 - End with a polite sign‑off (e.g., "Best regards,") followed by the sender name if provided.
 - Tone: friendly, professional, concise; be precise and non‑speculative. State assumptions briefly if needed.

Global:
- Keep Markdown.
- Preserve placeholders (e.g., {id}, %s, \${VAR}), regex, and escapes.
- Mask sensitive tokens/IDs (e.g., ****).
- Do not carry over content from previous turns unless explicit overrides are present.
- Preserve greetings/sign‑offs only if present.`.trim()
  },
  {
    name: "技术文档",
    name_en: "Technical Documentation",
    description: "For translating technical documentation",
    prompt: `Developer documentation/API reference.

- Keep Markdown semantics (headings, lists, tables, blockquotes, admonitions, links/anchors, images, math).
- Do not alter code or identifiers; translate only comments/user‑facing strings. Preserve placeholders (e.g., {var}, %s), regex, escapes, backslashes.
- Keep code block language tags, inline backticks, indentation, and line breaks; keep links unchanged.
- Use standard technical terminology; keep product names/proper nouns.
- Preserve versions, units, constants, and acronym casing.
- Preserve sample commands/outputs/config exactly; do not add commentary.
- Concise, precise, neutral; prefer imperative mood. No hallucinations.`.trim()
  },
  {
    name: "社交媒体帖子",
    name_en: "Social Media Post (X/Reddit)",
    description: "For translating engaging posts for X (Twitter) or Reddit.",
    prompt: "Translate as an X/Reddit post: concise, engaging; use suitable hashtags/emojis/formatting. Do not answer questions or provide solutions—only translate the original content."
  },
  {
    name: "需求分析",
    name_en: "Requirement Analysis",
    description: "For basic requirement understanding: translates, summarizes, and identifies the core business purpose of user-provided requirements (Salesforce, SAP focused).",
    prompt: "If needed, translate the requirements; then give a concise summary; finally state the underlying business purpose. Start directly with the translation/summary and end right after the purpose. No extra text."
  },
  {
    name: "会议邀请",
    name_en: "Meeting Invitation",
    description: "For translating formal meeting invitation messages.",
    prompt: "Formal meeting invitation: polite greeting; clear purpose, date/time, venue, agenda, participants; appropriate closing."
  },
  {
    name: "会议纪要",
    name_en: "Meeting Minutes",
    description: "For translating meeting minutes with a clear and structured format.",
    prompt: "Formal meeting minutes: clear headings/structure; summarize key points; record decisions; list action items for follow‑up."
  },
  {
    name: "谚语",
    name_en: "Proverbs",
    description: "Translate proverbs across cultures, preserving their wisdom and poetic essence.",
    prompt: `Translate proverbs bidirectionally.
      Style: poetic and culturally evocative; elegant yet approachable.
      Focus: equivalent core meaning and deep cultural resonance over literal wording; must feel natural and insightful in the target culture.
      Format: concise and impactful.
      No explanations or interpretations.`.trim()
  },
  {
    name: "演示文稿",
    name_en: "Presentation Slides",
    description: "For content used in presentation slides.",
    prompt: "Presentation slides: clear, concise; short bullet points; impactful, easy to read."
  }
];

