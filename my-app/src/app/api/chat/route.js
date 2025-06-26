import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { unifiedPlannerInstructions } from "@/lib/GPTinstructions";

export async function POST(req) {
  try {
    const {
      messages,
      stepOneData,
      stepTwoData,
      stepThreeData,
      systemPrompt, // ✅ dynamically passed prompt
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'messages' array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Fallback to the unified prompt if one isn't provided
    const promptToUse =
      typeof systemPrompt === "string" && systemPrompt.trim().length > 0
        ? systemPrompt.trim()
        : unifiedPlannerInstructions;

    console.log("📨 Incoming GPT request:");
    console.log("🧾 Using system prompt:", promptToUse.slice(0, 200), "...");

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages: [
        {
          role: "system",
          content: promptToUse,
        },
        ...messages,
      ],
      temperature: 0.7,
    });

    const { textStream } = result;

    return new Response(textStream, {
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
