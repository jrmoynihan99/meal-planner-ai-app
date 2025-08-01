import type { DayPlan } from "@/lib/store";
import type { StepThreePlannerData } from "@/lib/store";
import { useAppStore } from "@/lib/store";

export type VarietyOption = StepThreePlannerData["variety"];

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

// === Variety-to-range mapping based on mealsPerDay ===
function getVarietyMealRange(
  variety: VarietyOption,
  mealsPerDay: number
): [number, number | null] {
  // [min, max] (max=null means no upper bound)
  if (mealsPerDay === 2) {
    if (variety === "none") return [2, 2];
    if (variety === "some") return [3, 4];
    if (variety === "lots") return [5, null];
  }
  if (mealsPerDay === 3) {
    if (variety === "none") return [3, 3];
    if (variety === "some") return [4, 5];
    if (variety === "lots") return [6, null];
  }
  if (mealsPerDay === 4) {
    if (variety === "none") return [4, 4];
    if (variety === "some") return [5, 6];
    if (variety === "lots") return [7, null];
  }
  // fallback: treat like "none" for other values
  return [mealsPerDay, mealsPerDay];
}

// True if every day's locked slots match lockedMeals {slotIdx: mealId}
function comboRespectsLockedMeals(
  combo: DayPlan[],
  lockedMeals: Record<number, string | null>
) {
  const lockedEntries = Object.entries(lockedMeals).filter(
    ([, mealId]) => mealId
  );
  if (!lockedEntries.length) return true;
  return combo.every((dayPlan) =>
    lockedEntries.every(
      ([slotIdx, mealId]) => dayPlan.meals[Number(slotIdx)]?.mealId === mealId
    )
  );
}

// Get all combinations of k days from an array
function getCombos<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  if (k === 1) return arr.map((item) => [item]);
  const [first, ...rest] = arr;
  const withFirst = getCombos(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = getCombos(rest, k);
  return withFirst.concat(withoutFirst);
}

function getUniqueMealIds(combo: DayPlan[]): Set<string> {
  const ids = new Set<string>();
  combo.forEach((day) => {
    day.meals.forEach((m) => ids.add(m.mealId));
  });
  return ids;
}

// === Main combo generator ===
export function getAllCombosForVariety(
  allPlanOneDays: DayPlan[],
  allPlanTwoDays: DayPlan[],
  allPlanThreeDays: DayPlan[],
  variety: VarietyOption,
  mealsPerDay: number,
  lockedMeals: Record<number, string | null> = {}
): DayPlan[][] {
  const [minUnique, maxUnique] = getVarietyMealRange(variety, mealsPerDay);

  function getValidCombosFromPlan(planDays: DayPlan[]) {
    const results: DayPlan[][] = [];
    for (let k = 1; k <= planDays.length; k++) {
      for (const combo of getCombos(planDays, k)) {
        if (!comboRespectsLockedMeals(combo, lockedMeals)) continue;
        const uniqueMeals = getUniqueMealIds(combo).size;
        if (
          uniqueMeals >= minUnique &&
          (maxUnique === null || uniqueMeals <= maxUnique)
        ) {
          results.push(combo);
        }
      }
    }
    return results;
  }

  // --- Combine all combos ---
  const allCombos = [
    ...getValidCombosFromPlan(allPlanOneDays),
    ...getValidCombosFromPlan(allPlanTwoDays),
    ...getValidCombosFromPlan(allPlanThreeDays),
  ];

  // --- Deduplicate combos by their meal structure ---
  const seen = new Set<string>();
  const dedupedCombos: DayPlan[][] = [];
  for (const combo of allCombos) {
    // Canonical string: join sorted mealIds of all meals in all days, separated
    const comboKey = combo
      .map((day) => day.meals.map((m) => m.mealId).join(","))
      .join("|");
    if (!seen.has(comboKey)) {
      seen.add(comboKey);
      dedupedCombos.push(combo);
    }
  }
  return dedupedCombos;
}

// ===== MAIN FUNCTION (supports forward/backward shuffle) =====
/**
 * @param action
 *   "shuffle" = move forward (default, like before)
 *   "shuffle_back" = move backward (wraps around)
 *   "set" = reset to 0 (for variety change etc)
 */
export function updateWeeklyScheduleForVariety(
  variety: VarietyOption,
  allPlanOneDays: DayPlan[],
  allPlanTwoDays: DayPlan[],
  allPlanThreeDays: DayPlan[],
  shuffleIndices: StepThreePlannerData["shuffleIndices"],
  setStepThreeData: (fields: Partial<StepThreePlannerData>) => void,
  mealsPerDay: number,
  action: "shuffle" | "shuffle_back" | "set" = "set",
  lockedMeals: Record<number, string | null> = {}
) {
  console.log("[DEBUG] updateWeeklyScheduleForVariety called with", {
    variety,
    action,
    shuffleIndices,
    mealsPerDay,
    lockedMeals,
  });
  if (!mealsPerDay || mealsPerDay < 1)
    throw new Error("mealsPerDay is required and must be >= 1");

  const combos = getAllCombosForVariety(
    allPlanOneDays,
    allPlanTwoDays,
    allPlanThreeDays,
    variety,
    mealsPerDay,
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
  if (action === "shuffle") {
    curIdx = (curIdx + 1) % combos.length;
  } else if (action === "shuffle_back") {
    curIdx = (curIdx - 1 + combos.length) % combos.length;
  } else if (action === "set") {
    curIdx = 0;
  }
  if (curIdx >= combos.length) curIdx = 0;

  // Build new shuffleIndices object
  const newShuffleIndices = {
    ...shuffleIndices,
    weeklySchedule: {
      ...shuffleIndices.weeklySchedule,
      [variety]: curIdx,
    },
  };

  // Build the weekly schedule by cycling the selected combo (repeat for 7 days)
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

  if (sameSchedule) return;

  setStepThreeData({
    weeklySchedule,
    shuffleIndices: newShuffleIndices,
  });
}
