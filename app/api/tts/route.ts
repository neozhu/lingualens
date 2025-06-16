import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { text, voice = "Kore" } = await req.json();

  if (!text) {
    return new Response("Missing text", { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-tts",
    });

    // 使用类似于用户示例的结构
    const response = await model.generateContent({
      contents: [{ 
        role: "user",
        parts: [{ text }] 
      }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      } as any, // 临时使用 any 来避免类型错误，因为这些功能可能还在实验阶段
    });

    // 根据用户示例，音频数据应该在这个路径下
    const audioData = response.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
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