import type { DayPlan } from "@/lib/store";
import type { StepThreePlannerData } from "@/lib/store";
import { useAppStore } from "@/lib/store"; // <-- add this import

export type VarietyOption = StepThreePlannerData["variety"];

// Helper: How many unique days per variety
const VARIETY_TO_COUNT: Record<VarietyOption, number> = {
  none: 1,
  less: 2,
  some: 4,
  lots: 7,
};

// All days of the week (keep in sync with your DayOfWeek type)
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

// ===== COMBO GENERATOR =====
// Returns all combos of length N from one array
function getCombos<T>(arr: T[], n: number): T[][] {
  if (n === 0) return [[]];
  if (arr.length < n) return [];
  if (n === 1) return arr.map((item) => [item]);
  const [first, ...rest] = arr;
  const withFirst = getCombos(rest, n - 1).map((c) => [first, ...c]);
  const withoutFirst = getCombos(rest, n);
  return withFirst.concat(withoutFirst);
}

// Returns: Array of arrays, each is N unique days (from a single plan)
export function getAllCombosForVariety(
  allPlanOneDays: DayPlan[],
  allPlanTwoDays: DayPlan[],
  allPlanThreeDays: DayPlan[],
  variety: VarietyOption
): DayPlan[][] {
  const n = VARIETY_TO_COUNT[variety];
  return [
    ...getCombos(allPlanOneDays, n),
    ...getCombos(allPlanTwoDays, n),
    ...getCombos(allPlanThreeDays, n),
  ];
}

// ===== MAIN FUNCTION =====
export function updateWeeklyScheduleForVariety(
  variety: VarietyOption,
  allPlanOneDays: DayPlan[],
  allPlanTwoDays: DayPlan[],
  allPlanThreeDays: DayPlan[],
  shuffleIndices: StepThreePlannerData["shuffleIndices"],
  setStepThreeData: (fields: Partial<StepThreePlannerData>) => void,
  action: "shuffle" | "set" = "set"
) {
  const combos = getAllCombosForVariety(
    allPlanOneDays,
    allPlanTwoDays,
    allPlanThreeDays,
    variety
  );

  if (!combos.length) {
    // Build empty weeklySchedule (all null)
    const emptySchedule = Object.fromEntries(
      DAYS_OF_WEEK.map((d) => [d, null])
    ) as Record<(typeof DAYS_OF_WEEK)[number], null>;

    // --- GUARD: only update if schedule is actually changing ---
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

  // --- GUARD: only update if actual data has changed ---
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
