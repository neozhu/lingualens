'use server';

import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'

// Use Google Gemini 2.5 Flash Preview 05-20 model
const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20"

/**
 * Generate translation prompt for a specific scene
 * @param req Request object
 */
export async function POST(req: Request) {
    try {
        const { name, description } = await req.json()

        // Validate required parameters
        if (!name || !description) {
            return new Response(JSON.stringify({ error: "Name and description are required" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Build system prompt for generating translation instructions
        const systemPrompt = `
You are an expert prompt engineer. Your task is to generate a highly effective, scenario-specific translation prompt for AI models, based on the provided scene name and description. This prompt will guide accurate, context-aware translation for the given scenario.

Guidelines:
1. The prompt must be extremely concise—strictly no more than 350 characters.
2. Clearly specify the translation style, tone, and formality required for this scenario.
3. If relevant, mention how to handle domain-specific or specialized terminology.
4. State any format or structure that must be preserved in the translation.
5. Focus on the unique requirements of the provided scene.

Formatting:
- Use Markdown for clarity (bold for key points, bullet points if needed).
- Do NOT include JSON, code blocks, or any explanations outside the prompt itself.
- The response must be a single, well-formatted Markdown prompt, tailored to the scenario, and must not exceed 320 characters in total.
`

        // Build user prompt
        const userPrompt = `
Scene Name: ${name}
Description: ${description}

Please create a translation prompt for the above scene that will guide an AI model in performing high-quality bidirectional translation. Format the prompt using Markdown with headings, bold text, and bullet points as appropriate.
`

        // Create the streamable value for the response
        const streamablePrompt = createStreamableValue('')

        // Create Gemini model instance
        const provider = google(GEMINI_MODEL)        // Start the streaming process
        const streamPromise = (async () => {
            try {
                // Create a text stream from the Gemini model
                const { textStream } = streamText({
                    model: provider,
                    system: systemPrompt,
                    messages: [{ role: "user", content: userPrompt }],
                    temperature: 0.7, // Balance creativity and precision
                    topP: 0.9,
                })

                // Process each text chunk from the stream
                for await (const delta of textStream) {
                    // Update the streamable value with each new text chunk
                    streamablePrompt.update(delta);
                }

                // Mark the stream as complete when finished
                streamablePrompt.done()
            } catch (error) {
                console.error("Error in stream processing:", error)
                streamablePrompt.error(error instanceof Error ? error : new Error(String(error)))
            }
        })()        // Start the streaming process in the background (don't await it)
        // Acknowledge the streamPromise to ensure it runs in the background
        streamPromise.catch(error => console.error("Background stream processing error:", error));
        
        // Return a proper Response object with the streamable value
        // When working with streamableValue, we need to create a ReadableStream
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                // Function to process the streamable value
                const processStreamable = async (value: any) => {
                    // If there's a diff property with a string to append
                    if (value.diff) {
                        controller.enqueue(encoder.encode(value.diff[1]));
                    } 
                    // If there's a current value
                    else if (value.curr !== undefined) {
                        controller.enqueue(encoder.encode(value.curr));
                    }
                    
                    // If there's more content coming, wait for it recursively
                    if (value.next) {
                        const nextValue = await value.next;
                        await processStreamable(nextValue);
                    } else {
                        // No more content, close the stream
                        controller.close();
                    }
                };
                
                // Start processing the streamable value
                try {
                    await processStreamable(streamablePrompt.value);
                } catch (error) {
                    console.error('Error processing streamable value:', error);
                    controller.error(error);
                }
            }
        });
        
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        })
    } catch (error) {
        console.error("Error in prompt generation:", error)
        return new Response(JSON.stringify({ error: "Failed to generate translation prompt" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
