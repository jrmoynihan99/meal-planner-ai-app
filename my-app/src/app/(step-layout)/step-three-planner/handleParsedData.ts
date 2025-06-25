"use client";

import { useAppStore } from "@/lib/store";

export function handleParsedData(parsed: any) {
  console.log("🧠 handleParsedData called");
  console.log("→ Parsed object:", parsed);

  if (!parsed || typeof parsed !== "object") {
    console.warn("❌ Parsed data is invalid or missing.");
    return;
  }

  const { type, data } = parsed;
  if (!type || !data) {
    console.warn("❌ Parsed object missing 'type' or 'data' fields.");
    return;
  }

  const update = useAppStore.getState().setStepThreeData;
  const existing = useAppStore.getState().stepThreeData;

  switch (type) {
    case "approved_ingredients":
      if (Array.isArray(data.approvedIngredients)) {
        update({ ...existing, approvedIngredients: data.approvedIngredients });
        console.log("✅ Zustand updated with approvedIngredients");
      } else {
        console.warn("❌ approvedIngredients is missing or not an array.");
      }
      break;

    case "meal_count":
      if (typeof data.numberOfMeals === "number") {
        update({ ...existing, numberOfMeals: data.numberOfMeals });
        console.log("✅ Zustand updated with numberOfMeals");
      } else {
        console.warn("❌ numberOfMeals is missing or invalid.");
      }
      break;

    case "meal_generation":
      if (Array.isArray(data.meals)) {
        update({ ...existing, meals: data.meals });
        console.log("✅ Zustand updated with meals");
      } else {
        console.warn("❌ meals is missing or not an array.");
      }
      break;

    case "weekly_assignment":
      if (typeof data.weeklySchedule === "object") {
        update({ ...existing, weeklySchedule: data.weeklySchedule });
        console.log("✅ Zustand updated with weeklySchedule");
      } else {
        console.warn("❌ weeklySchedule is missing or invalid.");
      }
      break;

    default:
      console.warn("⚠️ Unrecognized type in parsed data:", type);
      break;
  }
}
