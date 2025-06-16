import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { text } = await req.json();

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
        // 由于TTS功能可能在实验阶段，我们直接传递text而不是音频配置
        // 如果需要音频功能，可能需要使用不同的API端点或等待SDK更新
      },
    });

    // 注意：当前的Google Generative AI SDK可能还不完全支持TTS功能
    // 这是一个占位符实现，等待官方SDK完全支持音频生成
    
    // 尝试获取音频数据
    const audioData = response.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (audioData) {
      // 如果有音频数据，返回音频
      const buffer = Buffer.from(audioData, 'base64');
      return new Response(buffer, {
        headers: {
          "Content-Type": "audio/wav",
          "Cache-Control": "no-store",
        },
      });
    } else {
      // 目前返回错误，因为TTS功能可能还不可用
      return new Response("Google Gemini TTS is not yet fully supported in the current SDK version", { 
        status: 501 
      });
    }
  } catch (error) {
    console.error('Gemini TTS Error:', error);
    return new Response("TTS Error", { status: 500 });
  }
}