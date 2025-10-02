// utils/filterDaysByLocks.ts
import type { DayPlan } from "@/lib/store";

export function filterDaysByLockedMeals(
  days: DayPlan[],
  lockedMeals: Record<number, string>
): DayPlan[] {
  return days.filter((day) =>
    Object.entries(lockedMeals).every(
      ([slotIdx, mealId]) => day.meals[Number(slotIdx)]?.mealId === mealId
    )
  );
}
