import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { unifiedPlannerInstructions } from "@/lib/GPTinstructions";

export async function POST(req) {
  try {
    const { messages, stepOneData, stepTwoData, stepThreeData } =
      await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'messages' array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `
${unifiedPlannerInstructions}

KNOWN USER DATA FOR YOUR REFERENCE:
- Sex: ${stepOneData?.sex || "unknown"}
- Age: ${stepOneData?.age || "unknown"}
- Height: ${
      stepOneData
        ? `${stepOneData.heightFt}'${stepOneData.heightIn}"`
        : "unknown"
    }
- Weight: ${stepOneData?.weight || "unknown"}
- Activity Level: ${stepOneData?.activity?.label || "unknown"}
- Maintenance Calories: ${stepOneData?.maintanenceCalories || "unknown"}

Goal info:
- Goal Type: ${stepTwoData?.selectedGoalTitle || "unknown"}
- Goal Calories: ${stepTwoData?.goalCalories || "unknown"}
- Goal Protein: ${stepTwoData?.goalProtein || "unknown"}
- Calorie Delta: ${stepTwoData?.calorieDeltaText || "unknown"}

Meal planning (in progress):
- Meals per day: ${stepThreeData?.mealsPerDay || "unknown"}
- Number of meals desired: ${stepThreeData?.numberOfMeals || "unknown"}
- Approved ingredients: ${
      stepThreeData?.approvedIngredients?.join(", ") || "none yet"
    }
- Approved meals: ${
      stepThreeData?.meals?.length
        ? stepThreeData.meals.map((m) => m.name).join(", ")
        : "none yet"
    }

You may reference this information at any time during the conversation.
`;

    console.log("📨 Incoming GPT request:");
    console.log("🧾 System Prompt:", systemPrompt);

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

    const { textStream } = result;

    return new Response(textStream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
