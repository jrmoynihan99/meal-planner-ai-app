// /utils/getNextMealColor.ts

import { Meal } from "@/lib/store";

export const MEAL_COLORS = [
  "#4F81BD", // muted blue
  "#C0504D", // muted brick red
  "#9BBB59", // muted green
  "#8064A2", // muted purple
  "#4BACC6", // muted teal
  "#F79646", // muted orange
  "#A6A6A6", // muted gray
  "#7F6084", // muted plum
  "#A2A2B8", // muted lavender
  "#C9B28E", // muted tan
];

export function getNextMealColor(approvedMeals: Meal[]): string {
  const usedColors = approvedMeals.map((m) => m.color).filter(Boolean);
  for (const color of MEAL_COLORS) {
    if (!usedColors.includes(color)) return color;
  }
  // If all colors are used, pick randomly (or you could cycle)
  return MEAL_COLORS[Math.floor(Math.random() * MEAL_COLORS.length)];
}
