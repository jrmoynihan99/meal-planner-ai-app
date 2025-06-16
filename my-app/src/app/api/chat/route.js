// /src/app/api/chat/route.js - Using AI SDK v4 streamText
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'messages' array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      messages: [
        {
          role: "system",
          content:
            "You are a nutrition assistant that helps users build personalized weekly meal plans. Use guided questions to collect calorie target, protein target, and meal preferences. When appropriate, return quick reply suggestions as JSON in the format: { type: 'prompt', content: '...', suggestions: ['Option 1', 'Option 2'] }. Respond clearly and concisely.",
        },
        ...messages,
      ],
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
