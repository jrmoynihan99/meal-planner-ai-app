import { DayPlan, Meal } from "@/lib/store";
import { OrderingResult } from "@/utils/solveOrderingSequence";
import { PortionedMeal } from "@/utils/solveDayPortions";

// Helper: Generates meal times based on count per day
function getDefaultMealTimes(count: number): string[] {
  if (count === 1) return ["15:00"];
  if (count === 2) return ["11:00", "17:00"];
  if (count === 3) return ["07:00", "12:00", "18:00"];
  if (count === 4) return ["07:00", "11:30", "15:00", "19:00"];
  // Evenly distribute for 5+ meals
  if (count > 4) {
    const start = 7; // 7 AM
    const end = 19; // 7 PM
    const interval = (end - start) / (count - 1);
    return Array.from({ length: count }, (_, i) => {
      const hour = Math.floor(start + i * interval);
      const min = Math.round((start + i * interval - hour) * 60);
      return `${hour.toString().padStart(2, "0")}:${min
        .toString()
        .padStart(2, "0")}`;
    });
  }
  // fallback
  return [];
}

export function buildZustandDayPlans(
  chosenResults: OrderingResult[],
  approvedMeals: Meal[]
) {
  const allPlanOneDays: DayPlan[] = [];
  const allPlanTwoDays: DayPlan[] = [];
  const allPlanThreeDays: DayPlan[] = [];

  function buildDaysArray(
    validDayPlans: PortionedMeal[][],
    planIndex: number
  ): DayPlan[] {
    return validDayPlans.map((mealsArr, i) => {
      const mealTimes = getDefaultMealTimes(mealsArr.length);

      return {
        id: `plan${planIndex + 1}-day${i + 1}`,
        planNumber: i + 1,
        meals: mealsArr.map((mealObj, idx) => {
          const refMeal = approvedMeals.find((m) => m.id === mealObj.mealId);
          return {
            mealId: mealObj.mealId,
            mealName: mealObj.mealName,
            mealDescription: refMeal?.description || "",
            bestFor: refMeal?.bestFor,
            imageUrl: refMeal?.imageUrl,
            color: refMeal?.color,
            ingredients: mealObj.ingredients.map((ing) => ({
              name: ing.name,
              grams: ing.grams ?? 0,
              protein: ing.protein ?? 0,
              calories: ing.calories ?? 0,
              amount: ing.amount ?? "",
            })),
            totalProtein: mealObj.totalProtein ?? 0,
            totalCalories: mealObj.totalCalories ?? 0,
            recipe: refMeal?.recipe ?? [],
            mealTime: mealTimes[idx] || "12:00",
          };
        }),
        dayProtein: mealsArr.reduce((sum, m) => sum + (m.totalProtein ?? 0), 0),
        dayCalories: mealsArr.reduce(
          (sum, m) => sum + (m.totalCalories ?? 0),
          0
        ),
        isCheatDay: false,
      };
    });
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
