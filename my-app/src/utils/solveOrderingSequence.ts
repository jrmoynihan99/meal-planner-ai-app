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
  const lockedPortions: Record<string, PortionedMeal> = {};
  const validDayPlans: PortionedMeal[][] = [];
  let validDays = 0;

  for (let dayIdx = 0; dayIdx < ordering.length; dayIdx++) {
    const dayMealNames = ordering[dayIdx];
    const dayMeals = dayMealNames.map((name) => mealData[name]);

    // Call the per-day solver (must await)
    const result: DayPortionResult = await solveDayPortions(
      dayMeals,
      targetCalories,
      targetProtein,
      lockedPortions
    );

    if (result.valid) {
      for (const meal of result.meals) {
        if (!lockedPortions[meal.mealId]) {
          lockedPortions[meal.mealId] = meal;
        }
      }
      validDayPlans.push(result.meals);
      validDays += 1;
    }
  }

  return {
    validDays,
    validDayPlans,
    portionedMeals: lockedPortions,
  };
}
