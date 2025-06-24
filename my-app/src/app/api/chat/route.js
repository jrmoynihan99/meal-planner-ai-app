import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { systemInstructionsByPhase } from "@/lib/phaseGPTinstructions"; // You'll need to move this to a shared location

export async function POST(req) {
  try {
    const { messages, phase } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'messages' array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pull system prompt based on current phase
    const baseInstructions = systemInstructionsByPhase?.[phase] || "";

    // Add instruction to include hidden phase marker in each assistant message
    const systemPrompt = baseInstructions;

    console.log("📨 Incoming GPT request:");
    console.log("🗂 Phase:", phase);
    console.log("💬 Messages:", JSON.stringify(messages, null, 2));
    console.log("🧾 System Instructions:", systemPrompt);

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
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
