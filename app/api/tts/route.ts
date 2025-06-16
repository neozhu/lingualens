import { NextRequest } from "next/server";
import { GoogleGenAI } from '@google/genai';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable')
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export const maxDuration = 30;

// Function to create WAV header for PCM data (matching Google Gemini TTS format)
function createWavHeader(dataLength: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const buffer = Buffer.alloc(44);
  let offset = 0;

  // RIFF header
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(36 + dataLength, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;

  // fmt chunk
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4; // PCM chunk size
  buffer.writeUInt16LE(1, offset); offset += 2; // PCM format
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(sampleRate * numChannels * bitsPerSample / 8, offset); offset += 4; // byte rate
  buffer.writeUInt16LE(numChannels * bitsPerSample / 8, offset); offset += 2; // block align
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;

  // data chunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataLength, offset);

  return buffer;
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
    
    // Create WAV file by adding header to PCM data
    const wavHeader = createWavHeader(pcmBuffer.length);
    const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);

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