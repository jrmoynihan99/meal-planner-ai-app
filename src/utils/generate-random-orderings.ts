// utils/generate-random-orderings.ts

/**
 * Fisher-Yates shuffle for deep-copying an array randomly
 */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateRandomOrderings<T>(
  allDayCombos: T[][],
  numOrderings: number
): T[][][] {
  const orderings: T[][][] = [];
  const seen = new Set<string>();

  for (let i = 0; i < numOrderings; i++) {
    const shuffled = shuffle(allDayCombos);
    // To avoid duplicate orderings, stringify by meal names/IDs
    const key = JSON.stringify(shuffled.map((day) => day.join(",")));
    if (!seen.has(key)) {
      orderings.push(shuffled.map((day) => [...day]));
      seen.add(key);
    }
    // If you want to cap at all unique orderings possible
    if (seen.size >= factorial(allDayCombos.length)) break;
  }
  return orderings;
}

// Helper to calculate factorial for cap (optional)
function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}
