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
    const file = form.get("audio") as unknown as File | null

    if (!file) {
      return new Response(JSON.stringify({ error: "Missing 'audio' file part" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString("base64")
    const mimeType = file.type || "audio/webm"

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_FLASH,
      contents: [
        {
          role: "user",
          parts: [
            { text: "Transcribe this audio to plain text. Output text only." },
            { inlineData: { data: base64Audio, mimeType } },
          ],
        },
      ],
    })

    // Extract text from response
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
      return new Response(JSON.stringify({ error: "No transcription produced" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error("Gemini STT Error:", error)
    return new Response(JSON.stringify({ error: "Transcription error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


