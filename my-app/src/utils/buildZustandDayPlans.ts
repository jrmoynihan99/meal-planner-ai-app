// utils/buildAllPlanDays.ts

import { DayPlan, Meal } from "@/lib/store";
import { OrderingResult } from "@/utils/solveOrderingSequence";

export function buildZustandDayPlans(
  chosenResults: OrderingResult[],
  approvedMeals: Meal[]
) {
  const allPlanOneDays: DayPlan[] = [];
  const allPlanTwoDays: DayPlan[] = [];
  const allPlanThreeDays: DayPlan[] = [];

  function buildDaysArray(validDayPlans: any[], planIndex: number): DayPlan[] {
    return validDayPlans.map((mealsArr, i) => ({
      id: `plan${planIndex + 1}-day${i + 1}`,
      planNumber: i + 1,
      meals: mealsArr.map((mealObj: any) => {
        const refMeal = approvedMeals.find((m) => m.id === mealObj.mealId);
        return {
          mealId: mealObj.mealId,
          mealName: mealObj.mealName,
          mealDescription: refMeal?.description || "",
          bestFor: refMeal?.bestFor || undefined,
          imageUrl: refMeal?.imageUrl || undefined,
          ingredients: mealObj.ingredients.map((ing: any) => ({
            name: ing.name,
            grams: ing.grams ?? 0,
            protein: ing.protein ?? 0,
            calories: ing.calories ?? 0,
            amount: ing.amount ?? "",
          })),
          totalProtein: mealObj.totalProtein ?? 0,
          totalCalories: mealObj.totalCalories ?? 0,
          recipe: refMeal?.recipe ?? [],
        };
      }),
      dayProtein: mealsArr.reduce(
        (sum: number, m: any) => sum + (m.totalProtein ?? 0),
        0
      ),
      dayCalories: mealsArr.reduce(
        (sum: number, m: any) => sum + (m.totalCalories ?? 0),
        0
      ),
      isCheatDay: false,
    }));
  }

  if (chosenResults[0]?.validDayPlans) {
    allPlanOneDays.push(...buildDaysArray(chosenResults[0].validDayPlans, 0));
  }
  if (chosenResults[1]?.validDayPlans) {
    allPlanTwoDays.push(...buildDaysArray(chosenResults[1].validDayPlans, 1));
  }
  if (chosenResults[2]?.validDayPlans) {
    allPlanThreeDays.push(...buildDaysArray(chosenResults[2].validDayPlans, 2));
  }

  return { allPlanOneDays, allPlanTwoDays, allPlanThreeDays };
}
