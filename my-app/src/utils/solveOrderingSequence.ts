// utils/solveOrderingSequence.ts
import { Meal } from "../lib/store";
import {
  PortionedMeal,
  solveDayPortions,
  DayPortionResult,
} from "./solveDayPortions";

/**
 * Each ordering is an array of days, each day is an array of meal names (ids or unique names).
 */
export interface OrderingResult {
  validDays: number;
  validDayPlans: PortionedMeal[][];
  portionedMeals: Record<string, PortionedMeal>;
}

/**
 * @param ordering - Array of days, each an array of meal names (ids)
 * @param mealData - Map from mealId or mealName to Meal object
 * @param targetCalories - Daily calorie target
 * @param targetProtein - Daily protein target
 * @returns An object containing validDays (number), validDayPlans (the meals for those days), and all portionedMeals used.
 */
export async function solveOrderingSequence(
  ordering: string[][], // Each day is an array of meal names/ids
  mealData: Record<string, Meal>,
  targetCalories: number,
  targetProtein: number
): Promise<OrderingResult> {
  console.log("=== SOLVING ORDERING SEQUENCE ===");
  console.log("Target Calories:", targetCalories);
  console.log("Target Protein:", targetProtein);
  console.log("Number of days:", ordering.length);
  console.log(
    "Ordering structure:",
    ordering.map((day, idx) => `Day ${idx + 1}: [${day.join(", ")}]`)
  );
  console.log("");

  const lockedPortions: Record<string, PortionedMeal> = {};
  const validDayPlans: PortionedMeal[][] = [];
  let validDays = 0;

  for (let dayIdx = 0; dayIdx < ordering.length; dayIdx++) {
    const dayMealNames = ordering[dayIdx];
    const dayMeals = dayMealNames.map((name) => mealData[name]);

    console.log(`--- DAY ${dayIdx + 1} ---`);
    console.log("Meal names:", dayMealNames);
    console.log(
      "Meals found:",
      dayMeals.map((meal) => (meal ? `${meal.name} (${meal.id})` : "NOT FOUND"))
    );

    // Log locked portions being passed in
    const relevantLockedPortions = Object.fromEntries(
      Object.entries(lockedPortions).filter(
        ([mealId]) =>
          dayMealNames.includes(mealId) ||
          dayMeals.some((meal) => meal?.id === mealId)
      )
    );

    console.log(
      "Locked portions for this day:",
      Object.keys(relevantLockedPortions).length > 0
        ? Object.entries(relevantLockedPortions)
            .map(
              ([id, portion]) =>
                `  ${portion.mealName} (${id}): ${portion.totalCalories.toFixed(
                  1
                )} cal, ${portion.totalProtein.toFixed(1)}g protein`
            )
            .join("\n")
        : "  None"
    );

    // Calculate remaining targets if there are locked portions
    const lockedCalories = Object.values(relevantLockedPortions).reduce(
      (sum, p) => sum + p.totalCalories,
      0
    );
    const lockedProtein = Object.values(relevantLockedPortions).reduce(
      (sum, p) => sum + p.totalProtein,
      0
    );
    const remainingCalories = targetCalories - lockedCalories;
    const remainingProtein = targetProtein - lockedProtein;

    if (Object.keys(relevantLockedPortions).length > 0) {
      console.log(
        `Remaining targets after locked portions: ${remainingCalories.toFixed(
          1
        )} cal, ${remainingProtein.toFixed(1)}g protein`
      );
    }

    // Call the per-day solver (must await)
    const result: DayPortionResult = await solveDayPortions(
      dayMeals,
      targetCalories,
      targetProtein,
      lockedPortions
    );

    console.log("Solver result:");
    console.log("  Valid:", result.valid);
    console.log("  Day calories:", result.dayCalories.toFixed(1));
    console.log("  Day protein:", result.dayProtein.toFixed(1));
    console.log("  Meals returned:", result.meals.length);

    if (result.meals.length > 0) {
      console.log("  Meal details:");
      result.meals.forEach((meal, idx) => {
        console.log(
          `    ${idx + 1}. ${meal.mealName} (${
            meal.mealId
          }): ${meal.totalCalories.toFixed(1)} cal, ${meal.totalProtein.toFixed(
            1
          )}g protein`
        );
      });
    }

    if (result.valid) {
      // Update locked portions with any new meals
      let newlyLockedCount = 0;
      for (const meal of result.meals) {
        if (!lockedPortions[meal.mealId]) {
          lockedPortions[meal.mealId] = meal;
          newlyLockedCount++;
        }
      }

      console.log(`  Added ${newlyLockedCount} new meals to locked portions`);
      console.log(
        `  Total locked portions now: ${Object.keys(lockedPortions).length}`
      );

      validDayPlans.push(result.meals);
      validDays += 1;
    } else {
      console.log("  ❌ Day failed - no valid solution found");
    }

    console.log(""); // Empty line between days
  }

  console.log("=== FINAL RESULTS ===");
  console.log("Valid days:", validDays, "out of", ordering.length);
  console.log(
    "Total unique meals portioned:",
    Object.keys(lockedPortions).length
  );
  console.log("Locked portion summary:");
  Object.entries(lockedPortions).forEach(([id, portion]) => {
    console.log(
      `  ${portion.mealName} (${id}): ${portion.totalCalories.toFixed(
        1
      )} cal, ${portion.totalProtein.toFixed(1)}g protein`
    );
  });
  console.log("=========================");
  console.log("");

  return {
    validDays,
    validDayPlans,
    portionedMeals: lockedPortions,
  };
}
