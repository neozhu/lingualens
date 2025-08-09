import { NextRequest } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { GEMINI_MODEL_FLASH } from "@/lib/models"

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable")
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()

    // Support both single 'image' and multiple 'images'
    const collected: File[] = []
    const single = form.get("image")
    if (single && single instanceof File) collected.push(single)
    const multiples = form.getAll("images").filter((v): v is File => v instanceof File)
    collected.push(...multiples)

    const images = collected.filter((f) => (f.type || "").startsWith("image/"))

    if (images.length === 0) {
      return new Response(JSON.stringify({ error: "No image files provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Convert images to base64
    const inlineParts = [] as Array<{ inlineData: { data: string; mimeType: string } }>
    for (const file of images) {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      const mimeType = file.type || "image/png"
      inlineParts.push({ inlineData: { data: base64, mimeType } })
    }

    const systemPrompt =
      "Perform high-fidelity OCR on the provided image(s). Preserve original formatting and layout as closely as possible. Output using Markdown when helpful: maintain headings, paragraphs, line breaks, lists, tables (use Markdown tables), and code blocks. Do not add commentary; output only the recognized content in text/Markdown."

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_FLASH,
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }, ...inlineParts],
        },
      ],
    })

    type GeminiResponse = {
      candidates?: Array<{
        content?: { parts?: Array<Record<string, unknown>> }
      }>
    }

    let text = ""
    const parts = (response as unknown as GeminiResponse).candidates?.[0]?.content?.parts
    if (Array.isArray(parts)) {
      for (const part of parts) {
        const maybeText = (part as { text?: unknown }).text
        if (typeof maybeText === "string") {
          text += maybeText
        }
      }
    }

    if (!text) {
      return new Response(JSON.stringify({ error: "No OCR text produced" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error("Gemini OCR Error:", error)
    return new Response(JSON.stringify({ error: "OCR error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


