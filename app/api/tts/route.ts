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

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      return new Response("No audio data generated", { status: 500 });
    }

    const buffer = Buffer.from(audioData, 'base64');
    
    // Check the audio format by examining the first few bytes
    const header = buffer.slice(0, 12);
    console.log('Audio header bytes:', Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // Determine content type based on header
    let contentType = "audio/wav";
    let fileExtension = "wav";
    
    // Check for different audio formats
    if (header.includes(Buffer.from('RIFF'))) {
      contentType = "audio/wav";
      fileExtension = "wav";
    } else if (header.includes(Buffer.from('ID3')) || buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0) {
      contentType = "audio/mpeg";
      fileExtension = "mp3";
    } else if (header.includes(Buffer.from('OggS'))) {
      contentType = "audio/ogg";
      fileExtension = "ogg";
    } else if (header.includes(Buffer.from('ftyp'))) {
      contentType = "audio/mp4";
      fileExtension = "m4a";
    }
    
    console.log(`Detected audio format: ${contentType}, buffer size: ${buffer.length} bytes`);

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `inline; filename="audio.${fileExtension}"`,
      },
    });
  } catch (error) {
    console.error('Gemini TTS Error:', error);
    return new Response("TTS Error", { status: 500 });
  }
}