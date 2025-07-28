// /utils/getNextMealColor.ts

import { Meal } from "@/lib/store";

export const MEAL_COLORS = [
  "#79a7d9", // Soft Blue (less bright)
  "#6cb7ae", // Dusty Aqua
  "#8ab595", // Muted Sage
  "#b7a6de", // Lilac Lavender
  "#c6bac8", // Misty Mauve
  "#b89586", // Dusty Coral
  "#8a99a7", // Slate Blue Gray
  "#e7cf93", // Soft Sand Yellow
  "#e8bfa7", // Muted Peach
  "#e2aab3", // Dusty Rose Pink
];

export function getNextMealColor(approvedMeals: Meal[]): string {
  const usedColors = approvedMeals.map((m) => m.color).filter(Boolean);
  for (const color of MEAL_COLORS) {
    if (!usedColors.includes(color)) return color;
  }
  // If all colors are used, pick randomly (or you could cycle)
  return MEAL_COLORS[Math.floor(Math.random() * MEAL_COLORS.length)];
}
