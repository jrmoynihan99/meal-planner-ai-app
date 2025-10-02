// /app/api/meal-brainstorm/route.ts
import OpenAI from "openai";
import { buildMealBrainstormPrompt } from "@/lib/prompts/mealBrainstorm";
import { NextRequest, NextResponse } from "next/server";

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    console.log("⚡️ Meal brainstorm route called");

    const {
      ingredientPreferences,
      mealsPerDay,
      previouslyApprovedMeals = [],
      previouslyGeneratedMeals = [],
    } = await req.json();

    console.log("📥 Received body:", {
      ingredientPreferences,
      mealsPerDay,
      previouslyApprovedMealsCount: previouslyApprovedMeals.length,
      previouslyGeneratedMealsCount: previouslyGeneratedMeals.length,
    });

    const prompt = buildMealBrainstormPrompt(
      ingredientPreferences,
      mealsPerDay,
      previouslyApprovedMeals,
      previouslyGeneratedMeals
    );

    console.log("📜 Prompt sent to GPT:\n", prompt);

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;
    console.log("📨 GPT content:", content);

    const json = extractJsonArray(content ?? "");
    console.log("✅ Parsed JSON array:", json);

    return NextResponse.json(json);
  } catch (err) {
    console.error("❌ GPT route error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Simple JSON block extractor
function extractJsonArray(text: string): unknown[] {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const match = cleaned.match(/\[.*\]/s);
    return match ? JSON.parse(match[0]) : [];
  } catch (err) {
    console.error("❌ Failed to extract JSON:", err);
    return [];
  }
}
