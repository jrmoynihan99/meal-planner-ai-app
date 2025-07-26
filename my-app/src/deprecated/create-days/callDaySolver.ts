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
  console.log("📦 Solver Input:");
  console.log("🍽 mealsPerDay:", mealsPerDay);
  console.log("🔥 targetCalories:", targetCalories);
  console.log("💪 targetProtein:", targetProtein);
  console.log("🥗 meals:", JSON.stringify(meals, null, 2));
  console.log(
    "🧮 ingredientMacros:",
    JSON.stringify(ingredientMacros, null, 2)
  );

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

  const result = await res.json();
  console.log("✅ Solver returned success. Output:", result);
  return result;
}
