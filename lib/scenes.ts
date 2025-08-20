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
    name: "Ticket Support",
    name_en: "Ticket Support",
    description: "Two‑phase workflow: translate foreign‑language ticket tickets into your native language (from locale); then turn your native‑language solution into a concise English reply with actionable steps.",
    prompt: `Ticket support assistant (2 phases). Decide phase from this message only.

- Phase 1 — Translate ticket → native language (from locale)
  - Trigger if it looks like a support ticket: has Details label, reporter name/date/time header, Or if the input is simply a user question/request without headers/labels, also treat as ticket.
  - Translate only user‑facing text; keep structure/line breaks; do not add solutions.
  - Preserve names, URLs, "Details", and header labels; do not translate code/identifiers/paths/JSON‑YAML keys/log lines.
  - Compact ticket header heuristics (no spaces between name/date/Details):
    - Use English month names as reliable split markers: January, February, March, April, May, June, July, August, September, October, November, December.
    - Reporter name = the full substring before the month token; keep all commas and multi-part segments (e.g., family name, given name, middle name). keep only the given/first name part.
    

-Phase 2 — English reply draft (for ticket):
 - Output in English, regardless of target locale.
 - Start with greeting: "Hi [Name]," (use provided name; if unknown, use "Hi there,").
 - Body: write a concise, actionable reply in English that combines:
  - the ticket context (problem details, user request), and
  - the solution or reply provided in this message (your intended answer).
  - If the intended solution is explicit, follow it exactly while phrasing it naturally in English.
 - End with a polite sign‑off (e.g., "Best regards,") followed by the sender name if provided.
 - Tone: friendly, professional, concise; be precise and non‑speculative. 

- Global
  - Keep Markdown; preserve placeholders (e.g., {id}, %s, \${VAR}), regex, escapes; mask sensitive tokens (****).
  - Each ticket is independent; never reuse past context.`.trim()
  },
  {
    name: "User Story",
    name_en: "User Story Analysis",
    description:"Analyzes user stories into structured insights (summary, purpose, solution, value analysis, effort estimation). Output adapts to locale: Chinese for zh-CN, otherwise English.",
    prompt:"If the user's native language (from locale) is Simplified Chinese, first translate the user story into Chinese, then provide the entire analysis in Chinese. Otherwise, provide the analysis in English only (skip translation).\n\nThe analysis must be structured in Markdown with the following sections:\n\n## Summary\n(Concise summary of the user story/request)\n\n## Business Purpose\n(Underlying business goal the user aims to achieve)\n\n## Solution\n(Proposed solution or development approach, e.g., Salesforce configuration, SAP process, or custom development)\n\n## Value Analysis\n(Expected business value such as efficiency, cost reduction, compliance, revenue impact; quantify where possible)\n\n## Effort Estimation\n(Estimated development effort as a range in person-days or weeks)\n\n- If locale=zh-CN: Begin with **Translation (zh-CN):** (the Chinese translation of the user story), then continue all sections in Chinese.\n- Otherwise: Start directly with **## Summary** and output all sections in English.\n\nEnd right after **## Effort Estimation**. No extra commentary."
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
    name: "会议邀请",
    name_en: "Meeting Invitation",
    description: "For translating formal meeting invitation messages.",
    prompt: "Formal meeting invitation: polite greeting; clear purpose, date/time, venue, agenda, participants; appropriate closing."
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
  }
];

