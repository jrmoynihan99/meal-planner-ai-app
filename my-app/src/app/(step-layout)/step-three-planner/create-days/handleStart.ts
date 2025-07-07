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

  try {
    const ingredientMacros = await fetchIngredientMacros(approvedMeals);
    const optimizedData = await callDaySolver({
      mealsPerDay,
      targetCalories: goalCalories,
      targetProtein: goalProtein,
      meals: approvedMeals,
      ingredientMacros,
    });

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
                amount: portion?.amount ?? "0g",
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

    setStepThreeData({
      allGeneratedDays: structuredDays,
      dayGenerationState: "completed",
    });
  } catch (err) {
    console.error("❌ Error during day generation pipeline:", err);
  }
}
