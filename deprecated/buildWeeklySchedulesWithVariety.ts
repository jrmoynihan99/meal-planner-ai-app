import { DayPlan, DayOfWeek, StepThreePlannerData } from "../src/lib/store";

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

// Helper to get all unique ordered combinations
function getCombinations<T>(arr: T[], k: number): T[][] {
  const results: T[][] = [];
  function backtrack(start: number, combo: T[]) {
    if (combo.length === k) {
      results.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      backtrack(i + 1, combo);
      combo.pop();
    }
  }
  if (k === 0) return [[]];
  backtrack(0, []);
  return results;
}

// Type for shuffle indices per plan and variety
export type ShuffleIndices = {
  weeklySchedule?: Partial<Record<StepThreePlannerData["variety"], number>>;
  weeklyScheduleTwo?: Partial<Record<StepThreePlannerData["variety"], number>>;
  weeklyScheduleThree?: Partial<
    Record<StepThreePlannerData["variety"], number>
  >;
};

// Main function
export function buildWeeklySchedulesWithVariety(
  planIndices: number[],
  variety: StepThreePlannerData["variety"],
  allPlanDaysObj: {
    allPlanOneDays: DayPlan[];
    allPlanTwoDays: DayPlan[];
    allPlanThreeDays: DayPlan[];
  },
  shuffleIndices?: ShuffleIndices // <<-- new arg, all optional
): {
  weeklySchedule?: Record<DayOfWeek, DayPlan | null>;
  weeklyScheduleTwo?: Record<DayOfWeek, DayPlan | null>;
  weeklyScheduleThree?: Record<DayOfWeek, DayPlan | null>;
} {
  // Helper: Get shuffle index for a given plan key/variety
  function getShuffleIdx(
    planKey: "weeklySchedule" | "weeklyScheduleTwo" | "weeklyScheduleThree",
    variety: StepThreePlannerData["variety"]
  ) {
    return shuffleIndices?.[planKey]?.[variety] ?? 0;
  }

  // Assignment logic for a given set of days/variety/index
  function assignToWeek(
    days: DayPlan[],
    variety: StepThreePlannerData["variety"],
    shuffleIdx: number
  ): Record<DayOfWeek, DayPlan | null> {
    // Determine group size for this variety
    let groupSize = 1;
    if (variety === "less") groupSize = Math.min(2, days.length);
    else if (variety === "some") groupSize = Math.min(4, days.length);
    else if (variety === "lots") groupSize = Math.min(7, days.length);

    // Get all possible combos in order
    const combos = getCombinations(days, groupSize);

    if (combos.length === 0) {
      // No days available, fill week with nulls
      return Object.fromEntries(daysOfWeek.map((dow) => [dow, null])) as Record<
        DayOfWeek,
        DayPlan | null
      >;
    }

    // For 'none', groupSize = 1, so combos = each individual day in order.
    // For other types, all combos.
    const idx = shuffleIdx % combos.length;
    const chosenDays = combos[idx];

    // Distribute across the week: repeat pattern if not enough for 7
    return Object.fromEntries(
      daysOfWeek.map((dow, i) => [
        dow,
        chosenDays[i % chosenDays.length] ??
          chosenDays[chosenDays.length - 1] ??
          null,
      ])
    ) as Record<DayOfWeek, DayPlan | null>;
  }

  // Output
  const out: {
    weeklySchedule?: Record<DayOfWeek, DayPlan | null>;
    weeklyScheduleTwo?: Record<DayOfWeek, DayPlan | null>;
    weeklyScheduleThree?: Record<DayOfWeek, DayPlan | null>;
  } = {};

  planIndices.forEach((idx) => {
    if (idx === 1)
      out.weeklySchedule = assignToWeek(
        allPlanDaysObj.allPlanOneDays,
        variety,
        getShuffleIdx("weeklySchedule", variety)
      );
    if (idx === 2)
      out.weeklyScheduleTwo = assignToWeek(
        allPlanDaysObj.allPlanTwoDays,
        variety,
        getShuffleIdx("weeklyScheduleTwo", variety)
      );
    if (idx === 3)
      out.weeklyScheduleThree = assignToWeek(
        allPlanDaysObj.allPlanThreeDays,
        variety,
        getShuffleIdx("weeklyScheduleThree", variety)
      );
  });

  return out;
}
