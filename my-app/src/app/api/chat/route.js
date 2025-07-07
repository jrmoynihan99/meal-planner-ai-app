import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(req) {
  try {
    const data = await req.json();
    const { messages, systemPrompt } = data;

    if (!systemPrompt || typeof systemPrompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid systemPrompt." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages: [
        { role: "system", content: systemPrompt },
        ...(messages ?? []),
      ],
      temperature: 0.7,
    });

    return new Response(result.textStream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("❌ Chat API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
