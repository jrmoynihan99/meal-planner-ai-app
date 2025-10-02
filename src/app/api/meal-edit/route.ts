// /app/api/meal-edit/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildMealEditPrompt } from "@/lib/prompts/mealEdit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { generatedMeals, userRequest } = await req.json();

    if (!generatedMeals || !userRequest) {
      return NextResponse.json(
        { error: "Missing meal or userRequest" },
        { status: 400 }
      );
    }

    const prompt = buildMealEditPrompt(generatedMeals, userRequest);

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;

    const parsed = extractJson(content || "");
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("❌ Meal edit route error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function extractJson(text: string) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const match = cleaned.match(/{.*}/s);
    return match ? JSON.parse(match[0]) : {};
  } catch (err) {
    console.error("❌ Failed to parse meal edit JSON:", err);
    return {};
  }
}
