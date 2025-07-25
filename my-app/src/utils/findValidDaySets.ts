export function findValidDaySets<T extends string | number>(
  combos: T[][]
): T[][][] {
  const validSets: T[][][] = [];

  function buildSet(
    currentSet: T[][],
    usedMeals: Record<T, number>,
    startIdx: number
  ) {
    let added = false;
    for (let i = startIdx; i < combos.length; i++) {
      const combo = combos[i];
      let canAdd = true;
      const slotAssignments = { ...usedMeals };

      for (let slot = 0; slot < combo.length; slot++) {
        const meal = combo[slot];
        if (
          slotAssignments[meal] !== undefined &&
          slotAssignments[meal] !== slot
        ) {
          canAdd = false;
          break;
        }
        slotAssignments[meal] = slot;
      }

      if (canAdd) {
        buildSet([...currentSet, combo], slotAssignments, i + 1);
        added = true;
      }
    }
    if (!added && currentSet.length > 0) {
      validSets.push(currentSet);
    }
  }

  buildSet([], {} as Record<T, number>, 0);

  // --- Only return the largest set(s), but no more than 3 randomly ---
  const maxLen =
    validSets.length === 0
      ? 0
      : Math.max(...validSets.map((set) => set.length));
  const largestSets = validSets.filter((set) => set.length === maxLen);

  if (largestSets.length > 3) {
    // Randomly shuffle and return up to 3
    const shuffled = [...largestSets].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }
  return largestSets;
}
