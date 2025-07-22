// /src/app/api/generate-meal-images/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { meal } = await req.json();

    console.log(`📥 [API] Received meal image request: ${meal?.name}`);

    if (!meal?.name || !Array.isArray(meal.ingredients)) {
      console.warn("⚠️ Invalid meal format", meal);
      return NextResponse.json(
        { error: "Invalid meal format" },
        { status: 400 }
      );
    }

    const ingredientNames = meal.ingredients.map((i: any) => i.name).join(", ");
    const prompt = `Realistic photo of a meal called "${meal.name}", made with ${ingredientNames}. Top-down food photography, vibrant lighting, plated beautifully.`;

    console.log(`🧠 [API] Prompt for ${meal.name}: ${prompt}`);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      console.error(`❌ [API] No image URL returned for ${meal.name}`);
      return NextResponse.json(
        { error: "No image URL returned" },
        { status: 500 }
      );
    }

    console.log(`✅ [API] Image URL for ${meal.name}: ${imageUrl}`);

    return NextResponse.json({ id: meal.id, imageUrl });
  } catch (err) {
    console.error("❌ [API] Image generation failed:", err);
    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
  }
}
