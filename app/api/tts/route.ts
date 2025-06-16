import { NextRequest } from "next/server";
import { GoogleGenAI } from '@google/genai';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable')
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { text, voice = "Kore" } = await req.json();

  if (!text) {
    return new Response("Missing text", { status: 400 });
  }

  try {
    // 根据官方示例使用正确的 API 结构
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

    // 获取音频数据
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      return new Response("No audio data generated", { status: 500 });
    }

    // 将 base64 数据转换为 Buffer
    const buffer = Buffer.from(audioData, 'base64');

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error('Gemini TTS Error:', error);
    return new Response("TTS Error", { status: 500 });
  }
}