"use client";

import { MealDetailsModal } from "../create-days/MealDetailsModal";
import type { Meal } from "@/lib/store";

interface ScaledIngredient {
  name: string;
  grams: number;
  protein: number;
  calories: number;
}

interface ScaledMeal {
  ingredients: ScaledIngredient[];
  totalCalories: number;
  totalProtein: number;
}

interface MealPlanOverlayProps {
  mealMeta: Meal;
  scaledMeal: ScaledMeal;
  onClose: () => void; // Closes all overlays
  onBack: () => void; // Goes back to wrapper
  initialTab: "ingredients" | "recipe";
}

export function MealPlanOverlay({
  mealMeta,
  scaledMeal,
  onClose,
  onBack,
  initialTab,
}: MealPlanOverlayProps) {
  return (
    <MealDetailsModal
      mealMeta={mealMeta}
      scaledMeal={scaledMeal}
      isOpen={true}
      initialTab={initialTab}
      onClose={onClose}
      onBack={onBack} // Pass to modal
    />
  );
}
