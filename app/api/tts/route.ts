import { NextRequest } from "next/server";
import { GoogleGenAI } from '@google/genai';
import Groq from "groq-sdk";

// 尝试 Google Gemini TTS，如果失败则回退到 Groq
const useGeminiTTS = process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.USE_GEMINI_TTS === 'true';

let ai: GoogleGenAI | null = null;
let groq: Groq | null = null;

if (useGeminiTTS && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
}

if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { text, voice = "Kore" } = await req.json();

  if (!text) {
    return new Response("Missing text", { status: 400 });
  }

  // 优先尝试 Google Gemini TTS
  if (useGeminiTTS && ai) {
    try {
      console.log(`🎵 Trying Gemini TTS: "${text}" with voice: "${voice}"`);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      console.log('🔍 Gemini response structure:', JSON.stringify(response, null, 2));

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (audioData) {
        console.log(`✅ Gemini audio data received, length: ${audioData.length} characters`);
        const buffer = Buffer.from(audioData, 'base64');
        console.log(`🎧 Gemini audio buffer size: ${buffer.length} bytes`);

        return new Response(buffer, {
          headers: {
            "Content-Type": "audio/wav",
            "Cache-Control": "no-store",
            "Content-Length": buffer.length.toString(),
          },
        });
      }
    } catch (error) {
      console.error('❌ Gemini TTS failed, falling back to Groq:', error);
    }
  }

  // 回退到 Groq TTS
  if (groq) {
    try {
      console.log(`🎵 Using Groq TTS: "${text}"`);
      
      const response = await groq.audio.speech.create({
        model: "playai-tts",
        voice: "Arista-PlayAI",
        input: text,
        response_format: "wav",
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      console.log(`🎧 Groq audio buffer size: ${buffer.length} bytes`);

      return new Response(buffer, {
        headers: {
          "Content-Type": "audio/wav",
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      console.error('❌ Groq TTS Error:', error);
      return new Response("TTS Error", { status: 500 });
    }
  }

  return new Response("No TTS service available", { status: 503 });
}