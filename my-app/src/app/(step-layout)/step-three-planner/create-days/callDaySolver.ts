import { Meal } from "@/lib/store";

export async function callDaySolver({
  mealsPerDay,
  targetCalories,
  targetProtein,
  meals,
  ingredientMacros,
}: {
  mealsPerDay: number;
  targetCalories: number;
  targetProtein: number;
  meals: Meal[];
  ingredientMacros: Record<
    string,
    { calories_per_gram: number; protein_per_gram: number }
  >;
}) {
  const res = await fetch("/api/optimize-days", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mealsPerDay,
      targetCalories,
      targetProtein,
      meals,
      ingredientMacros,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error("Solver returned error:\n" + error);
  }

  return await res.json();
}
