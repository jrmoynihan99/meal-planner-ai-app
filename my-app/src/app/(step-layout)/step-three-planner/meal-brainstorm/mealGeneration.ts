// mealGeneration.ts

import { Meal } from "@/lib/store";
import { StepThreePlannerData } from "@/lib/store";
import { generateImagesForMealsInBackground } from "./generateImagesForMealsInBackground";

interface GenerateMealsOptions {
  stepThreeData: StepThreePlannerData;
  setStepThreeData: (partial: Partial<StepThreePlannerData>) => void;
  setMealBrainstormState: (
    state: StepThreePlannerData["mealBrainstormState"]
  ) => void;
}

export async function generateMeals({
  stepThreeData,
  setStepThreeData,
  setMealBrainstormState,
}: GenerateMealsOptions): Promise<void> {
  if (!stepThreeData?.ingredientPreferences || !stepThreeData?.mealsPerDay) {
    console.error("Missing preferences or mealsPerDay");
    setMealBrainstormState("not_started");
    return;
  }

  const {
    ingredientPreferences,
    mealsPerDay,
    approvedMeals = [],
    generatedMeals = [],
  } = stepThreeData;

  setMealBrainstormState("loading");

  try {
    const res = await fetch("/api/meal-brainstorm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredientPreferences,
        mealsPerDay,
        previouslyApprovedMeals: approvedMeals,
        previouslyGeneratedMeals: generatedMeals,
      }),
    });

    const text = await res.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("Invalid GPT format");

    const allowedBestFor = ["breakfast", "lunch", "dinner", "versatile"];
    const mealsWithIds: Meal[] = data.map((meal: Meal) => ({
      ...meal,
      id: meal.id || crypto.randomUUID(),
      bestFor: allowedBestFor.includes(meal.bestFor ?? "")
        ? meal.bestFor
        : "versatile",
    }));

    const reapproved = mealsWithIds.filter((meal: Meal) =>
      approvedMeals.some(
        (a) => a.name.toLowerCase() === meal.name.toLowerCase()
      )
    );

    const newGeneratedMeals = [...mealsWithIds, ...generatedMeals];
    const newApprovedMeals = [
      ...approvedMeals,
      ...reapproved.filter(
        (newMeal) =>
          !approvedMeals.some((existing) => existing.id === newMeal.id)
      ),
    ];

    setStepThreeData({
      generatedMeals: newGeneratedMeals,
      approvedMeals: newApprovedMeals,
    });

    setMealBrainstormState("completed");
    generateImagesForMealsInBackground(mealsWithIds, setStepThreeData);
  } catch (err) {
    console.error("\u274C GPT meal generation failed:", err);
    setMealBrainstormState("not_started");
  }
}
