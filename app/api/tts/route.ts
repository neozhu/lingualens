import { NextRequest } from "next/server";
import { GoogleGenAI } from '@google/genai';
import * as wav from 'wav';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable')
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export const maxDuration = 30;

// Function to create WAV file from PCM data using wav library
function createWavBuffer(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    const writer = new wav.FileWriter({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    writer.on('finish', () => {
      const wavBuffer = Buffer.concat(chunks);
      resolve(wavBuffer);
    });

    writer.on('error', reject);

    writer.write(pcmData);
    writer.end();
  });
}

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

    const pcmBuffer = Buffer.from(audioData, 'base64');
    console.log('PCM data received, size:', pcmBuffer.length);
    
    // Convert PCM data to WAV format using wav library (like in the official example)
    const wavBuffer = await createWavBuffer(pcmBuffer);
    console.log('WAV file created, size:', wavBuffer.length);

    return new Response(wavBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
        "Content-Length": wavBuffer.length.toString(),
        "Content-Disposition": `inline; filename="audio.wav"`,
      },
    });
  } catch (error) {
    console.error('Gemini TTS Error:', error);
    return new Response("TTS Error", { status: 500 });
  }
}