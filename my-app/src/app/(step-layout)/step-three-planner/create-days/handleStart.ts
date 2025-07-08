"use client";
import { fetchIngredientMacros } from "./fetchIngredientMacros";
import { callDaySolver } from "./callDaySolver";
import { useAppStore } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

export async function handleStart() {
  const setStepThreeData = useAppStore.getState().setStepThreeData;
  const { stepThreeData, stepTwoData } = useAppStore.getState();
  const { mealsPerDay, approvedMeals } = stepThreeData ?? {};
  const { goalCalories, goalProtein } = stepTwoData ?? {};

  console.log("🚀 handleStart triggered");
  console.log("📥 Inputs:", {
    mealsPerDay,
    approvedMeals,
    goalCalories,
    goalProtein,
  });

  if (
    !mealsPerDay ||
    !approvedMeals ||
    approvedMeals.length === 0 ||
    goalCalories == null ||
    goalProtein == null
  ) {
    console.error("❌ Missing mealsPerDay, approvedMeals, or goal targets.");
    return;
  }

  setStepThreeData({ dayGenerationState: "started" });
  console.log("⏳ Day generation state set to 'started'");

  try {
    console.log("🔍 Fetching ingredient macros...");
    const ingredientMacros = await fetchIngredientMacros(approvedMeals);
    console.log("✅ Fetched ingredient macros:", ingredientMacros);

    console.log("📡 Calling day solver with:", {
      mealsPerDay,
      targetCalories: goalCalories,
      targetProtein: goalProtein,
      meals: approvedMeals,
      ingredientMacros,
    });

    const optimizedData = await callDaySolver({
      mealsPerDay,
      targetCalories: goalCalories,
      targetProtein: goalProtein,
      meals: approvedMeals,
      ingredientMacros,
    });

    console.log("📦 Solver returned:", optimizedData);

    console.log("🧠 Structuring output...");
    const structuredDays = optimizedData.validDays.map(
      (day: any, i: number) => ({
        id: uuidv4(),
        meals: day.meals.map((mealName: string) => {
          const meal = approvedMeals.find((m) => m.name === mealName);
          if (!meal) throw new Error(`Meal not found: ${mealName}`);
          return {
            mealId: meal.id,
            ingredients: meal.ingredients.map((ing) => {
              const portion = day.ingredientPortions[mealName]?.[ing.name];
              return {
                name: ing.name,
                grams: portion?.grams ?? 0, // Changed from 'amount' to 'grams'
                protein: portion?.protein ?? 0,
                calories: portion?.calories ?? 0,
              };
            }),
            totalProtein: meal.ingredients.reduce((sum, ing) => {
              return (
                sum +
                (day.ingredientPortions[meal.name]?.[ing.name]?.protein ?? 0)
              );
            }, 0),
            totalCalories: meal.ingredients.reduce((sum, ing) => {
              return (
                sum +
                (day.ingredientPortions[meal.name]?.[ing.name]?.calories ?? 0)
              );
            }, 0),
          };
        }),
        dayProtein: day.totals.protein,
        dayCalories: day.totals.calories,
      })
    );

    console.log("✅ Structured days:", structuredDays);

    setStepThreeData({
      allGeneratedDays: structuredDays,
      dayGenerationState: "completed",
    });

    console.log("🏁 Day generation complete — state set to 'completed'");
  } catch (err) {
    console.error("❌ Error during day generation pipeline:", err);
  }
}
