import { Meal } from "@/lib/store";

// Helper: Which slots can each meal type go in?
function getAllowedSlots(
  bestFor: Meal["bestFor"],
  mealsPerDay: number
): number[] {
  switch (mealsPerDay) {
    case 1:
      return [0];
    case 2:
      if (bestFor === "breakfast") return [0];
      if (bestFor === "lunch") return [0, 1];
      if (bestFor === "dinner") return [1];
      if (bestFor === "versatile" || !bestFor) return [0, 1];
      break;
    case 3:
      if (bestFor === "breakfast") return [0];
      if (bestFor === "lunch") return [1, 2];
      if (bestFor === "dinner") return [1, 2];
      if (bestFor === "versatile" || !bestFor) return [0, 1, 2];
      break;
    case 4:
      if (bestFor === "breakfast") return [0, 1];
      if (bestFor === "lunch") return [1, 2];
      if (bestFor === "dinner") return [2, 3];
      if (bestFor === "versatile" || !bestFor) return [0, 1, 2, 3];
      break;
    default:
      throw new Error("mealsPerDay must be 1-4");
  }
  return [];
}

// Helper: Get all possible slot assignments for versatile meals
function getAllSlotAssignments(
  versatileMeals: Meal[],
  mealsPerDay: number
): number[][] {
  function cartesian(arrays: number[][]): number[][] {
    return arrays.reduce<number[][]>(
      (acc, curr) =>
        acc
          .map((a) => curr.map((b) => [...a, b]))
          .reduce((a, b) => a.concat(b), []),
      [[]]
    );
  }
  const slotOptions = versatileMeals.map((m) =>
    getAllowedSlots(m.bestFor, mealsPerDay)
  );
  return cartesian(slotOptions);
}

export function generateDayCombinations(
  approvedMeals: Meal[],
  mealsPerDay: number
): string[][] {
  // 1. Partition meals
  const breakfastMeals = approvedMeals.filter((m) => m.bestFor === "breakfast");
  const lunchMeals = approvedMeals.filter((m) => m.bestFor === "lunch");
  const dinnerMeals = approvedMeals.filter((m) => m.bestFor === "dinner");
  const versatileMeals = approvedMeals.filter(
    (m) => m.bestFor === "versatile" || !m.bestFor
  );

  // 3. Get all possible slot assignments for versatile meals
  const versatileAssignments = getAllSlotAssignments(
    versatileMeals,
    mealsPerDay
  );

  const allDayCombos: string[][] = [];

  // 4. For each assignment of versatile meals...
  versatileAssignments.forEach((assignment) => {
    // Build slot-to-meal map for this assignment
    const slotMeals: Meal[][] = Array.from({ length: mealsPerDay }, () => []);
    // Add fixed meals to each slot where allowed
    for (let slot = 0; slot < mealsPerDay; slot++) {
      // breakfast
      slotMeals[slot].push(
        ...breakfastMeals.filter((m) =>
          getAllowedSlots(m.bestFor, mealsPerDay).includes(slot)
        )
      );
      // lunch
      slotMeals[slot].push(
        ...lunchMeals.filter((m) =>
          getAllowedSlots(m.bestFor, mealsPerDay).includes(slot)
        )
      );
      // dinner
      slotMeals[slot].push(
        ...dinnerMeals.filter((m) =>
          getAllowedSlots(m.bestFor, mealsPerDay).includes(slot)
        )
      );
    }
    // Add versatile meals according to this assignment
    assignment.forEach((slotIndex, i) => {
      slotMeals[slotIndex].push(versatileMeals[i]);
    });

    // 5. Generate all possible combos where no meal repeats in the day
    function generateCombos(slots: Meal[][], prefix: Meal[] = [], idx = 0) {
      if (idx === slots.length) {
        const ids = prefix.map((m) => m.id);
        if (new Set(ids).size === ids.length) {
          // Only log meal names
          const mealNames = prefix.map((m) => m.name);
          allDayCombos.push(mealNames);
        }
        return;
      }
      for (const meal of slots[idx]) {
        generateCombos(slots, [...prefix, meal], idx + 1);
      }
    }

    generateCombos(slotMeals);
  });

  return allDayCombos;
}
