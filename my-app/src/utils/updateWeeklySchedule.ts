import type { DayPlan } from "@/lib/store";
import type { StepThreePlannerData } from "@/lib/store";
import { useAppStore } from "@/lib/store";

export type VarietyOption = StepThreePlannerData["variety"];

const VARIETY_TO_COUNT: Record<VarietyOption, number> = {
  none: 1,
  less: 2,
  some: 4,
  lots: 7,
};

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

// =========== LOCKED FILTER ===========
// True if every day's locked slots match lockedMeals {slotIdx: mealId}
function comboRespectsLockedMeals(
  combo: DayPlan[],
  lockedMeals: Record<number, string | null>
) {
  const lockedEntries = Object.entries(lockedMeals).filter(
    ([, mealId]) => mealId
  );
  if (!lockedEntries.length) return true; // No locks, all combos valid

  return combo.every((dayPlan) =>
    lockedEntries.every(
      ([slotIdx, mealId]) => dayPlan.meals[Number(slotIdx)]?.mealId === mealId
    )
  );
}

// ===== COMBO GENERATOR =====
function getCombos<T>(arr: T[], n: number): T[][] {
  if (n === 0) return [[]];
  if (arr.length < n) return [];
  if (n === 1) return arr.map((item) => [item]);
  const [first, ...rest] = arr;
  const withFirst = getCombos(rest, n - 1).map((c) => [first, ...c]);
  const withoutFirst = getCombos(rest, n);
  return withFirst.concat(withoutFirst);
}

// =========== ALL COMBOS, FILTERED BY LOCKED ===========
// Returns array of combos (length N), only if all locked slots match in each day
export function getAllCombosForVariety(
  allPlanOneDays: DayPlan[],
  allPlanTwoDays: DayPlan[],
  allPlanThreeDays: DayPlan[],
  variety: VarietyOption,
  lockedMeals: Record<number, string | null> = {}
): DayPlan[][] {
  const n = VARIETY_TO_COUNT[variety];
  const allCombos = [
    ...getCombos(allPlanOneDays, n),
    ...getCombos(allPlanTwoDays, n),
    ...getCombos(allPlanThreeDays, n),
  ];
  return allCombos.filter((combo) =>
    comboRespectsLockedMeals(combo, lockedMeals)
  );
}

// ===== MAIN FUNCTION (respects lockedMeals) =====
export function updateWeeklyScheduleForVariety(
  variety: VarietyOption,
  allPlanOneDays: DayPlan[],
  allPlanTwoDays: DayPlan[],
  allPlanThreeDays: DayPlan[],
  shuffleIndices: StepThreePlannerData["shuffleIndices"],
  setStepThreeData: (fields: Partial<StepThreePlannerData>) => void,
  action: "shuffle" | "set" = "set",
  lockedMeals: Record<number, string | null> = {}
) {
  // Filter combos to respect locked meals!
  const combos = getAllCombosForVariety(
    allPlanOneDays,
    allPlanTwoDays,
    allPlanThreeDays,
    variety,
    lockedMeals
  );

  if (!combos.length) {
    // Build empty weeklySchedule (all null)
    const emptySchedule = Object.fromEntries(
      DAYS_OF_WEEK.map((d) => [d, null])
    ) as Record<(typeof DAYS_OF_WEEK)[number], null>;

    // Only update if changed
    const current = useAppStore.getState().stepThreeData;
    if (
      JSON.stringify(current?.weeklySchedule) === JSON.stringify(emptySchedule)
    ) {
      return;
    }

    setStepThreeData({
      weeklySchedule: emptySchedule,
    });
    return;
  }

  // Get current index for this variety (default 0)
  let curIdx = shuffleIndices.weeklySchedule?.[variety] ?? 0;

  // Increment if shuffling
  if (action === "shuffle") {
    curIdx = (curIdx + 1) % combos.length;
  }
  // Clamp just in case
  if (curIdx >= combos.length) curIdx = 0;

  // Build new shuffleIndices object
  const newShuffleIndices = {
    ...shuffleIndices,
    weeklySchedule: {
      ...shuffleIndices.weeklySchedule,
      [variety]: curIdx,
    },
  };

  // Build the weekly schedule by cycling the selected combo
  const selectedCombo = combos[curIdx];
  const weeklySchedule: Record<string, DayPlan | null> = {};
  for (let i = 0; i < DAYS_OF_WEEK.length; i++) {
    weeklySchedule[DAYS_OF_WEEK[i]] = selectedCombo[i % selectedCombo.length];
  }

  // Only update if changed
  const current = useAppStore.getState().stepThreeData;
  const sameSchedule =
    JSON.stringify(current?.weeklySchedule) ===
      JSON.stringify(weeklySchedule) &&
    JSON.stringify(current?.shuffleIndices) ===
      JSON.stringify(newShuffleIndices);

  if (sameSchedule) {
    return;
  }

  setStepThreeData({
    weeklySchedule,
    shuffleIndices: newShuffleIndices,
  });
}
