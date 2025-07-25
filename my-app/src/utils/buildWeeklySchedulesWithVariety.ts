// utils/buildWeeklySchedulesWithVariety.ts

import { DayPlan, DayOfWeek } from "@/lib/store";

// Days of week in order
const daysOfWeek: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type Variety = "less" | "moderate" | "lots";

// Takes: which [1,2,3], variety string, and allPlanDays object from Zustand
export function buildWeeklySchedulesWithVariety(
  planIndices: number[], // e.g. [1,2] for first and second plan
  variety: Variety,
  allPlanDaysObj: {
    allPlanOneDays: DayPlan[];
    allPlanTwoDays: DayPlan[];
    allPlanThreeDays: DayPlan[];
  }
): {
  weeklySchedule?: Record<DayOfWeek, DayPlan | null>;
  weeklyScheduleTwo?: Record<DayOfWeek, DayPlan | null>;
  weeklyScheduleThree?: Record<DayOfWeek, DayPlan | null>;
} {
  // Helper to pick N unique random elements from array
  function pickRandomUnique<T>(arr: T[], n: number): T[] {
    if (arr.length <= n) return [...arr];
    const arrCopy = [...arr];
    const selected: T[] = [];
    while (selected.length < n && arrCopy.length > 0) {
      const idx = Math.floor(Math.random() * arrCopy.length);
      selected.push(arrCopy.splice(idx, 1)[0]);
    }
    return selected;
  }

  // Given days, assign to week by variety
  function assignToWeek(
    days: DayPlan[],
    variety: Variety
  ): Record<DayOfWeek, DayPlan | null> {
    let chosenDays: DayPlan[];
    if (variety === "less") {
      chosenDays = pickRandomUnique(days, Math.min(2, days.length));
      // Alternate: 0, 1, 0, 1, ...
      return Object.fromEntries(
        daysOfWeek.map((dow, i) => [
          dow,
          chosenDays[i % chosenDays.length] ?? null,
        ])
      ) as Record<DayOfWeek, DayPlan | null>;
    }
    if (variety === "moderate") {
      chosenDays = pickRandomUnique(days, Math.min(4, days.length));
      // Alternate: 0,1,2,3,0,1,2
      return Object.fromEntries(
        daysOfWeek.map((dow, i) => [
          dow,
          chosenDays[i % chosenDays.length] ?? null,
        ])
      ) as Record<DayOfWeek, DayPlan | null>;
    }
    // "lots": up to 7 unique days, or as many as available
    chosenDays = pickRandomUnique(days, Math.min(7, days.length));
    return Object.fromEntries(
      daysOfWeek.map((dow, i) => [
        dow,
        chosenDays[i] ?? chosenDays[chosenDays.length - 1] ?? null,
      ])
    ) as Record<DayOfWeek, DayPlan | null>;
  }

  // Output schedules
  const out: {
    weeklySchedule?: Record<DayOfWeek, DayPlan | null>;
    weeklyScheduleTwo?: Record<DayOfWeek, DayPlan | null>;
    weeklyScheduleThree?: Record<DayOfWeek, DayPlan | null>;
  } = {};

  planIndices.forEach((idx) => {
    if (idx === 1)
      out.weeklySchedule = assignToWeek(allPlanDaysObj.allPlanOneDays, variety);
    if (idx === 2)
      out.weeklyScheduleTwo = assignToWeek(
        allPlanDaysObj.allPlanTwoDays,
        variety
      );
    if (idx === 3)
      out.weeklyScheduleThree = assignToWeek(
        allPlanDaysObj.allPlanThreeDays,
        variety
      );
  });

  return out;
}
