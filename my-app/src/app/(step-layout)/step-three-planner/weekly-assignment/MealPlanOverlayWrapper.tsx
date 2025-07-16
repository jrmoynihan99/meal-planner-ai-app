"use client";

import { useState } from "react";
import { MealPlanOverlay } from "./MealPlanOverlay";
import { CloseButton } from "@/components/CloseButton";
import type { DayPlan, Meal } from "@/lib/store";

interface MealPlanOverlayWrapperProps {
  dayPlan: DayPlan;
  approvedMeals: Meal[];
  onClose: () => void; // Closes both layers
}

type OverlayState =
  | { type: "day" }
  | { type: "meal"; mealIndex: number; tab: "ingredients" | "recipe" };

export function MealPlanOverlayWrapper({
  dayPlan,
  approvedMeals,
  onClose,
}: MealPlanOverlayWrapperProps) {
  const [overlayState, setOverlayState] = useState<OverlayState>({
    type: "day",
  });

  if (overlayState.type === "meal") {
    const meal = dayPlan.meals[overlayState.mealIndex];
    const meta = approvedMeals.find((m) => m.id === meal.mealId);
    if (meta) {
      return (
        <MealPlanOverlay
          mealMeta={meta}
          scaledMeal={{
            ingredients: meal.ingredients,
            totalCalories: meal.totalCalories,
            totalProtein: meal.totalProtein,
          }}
          initialTab={overlayState.tab}
          onClose={onClose}
          onBack={() => setOverlayState({ type: "day" })}
        />
      );
    }
  }

  return (
    <div className="fixed inset-0 z-60 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
      <div className="relative inline-flex w-full max-w-lg">
        {/* Glow Border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm opacity-60 hover:opacity-100 transition-all duration-500 ease-in-out" />

        {/* Content Box */}
        <div className="relative bg-zinc-900 text-white rounded-xl p-6 w-full border border-zinc-800 shadow-xl">
          <CloseButton onClick={onClose} className="absolute top-3 right-3" />

          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
            Daily Plan
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              Day {dayPlan.planNumber}
            </h2>
            <div className="flex gap-4 text-sm font-mono text-zinc-300">
              <span>
                Calories:{" "}
                <code className="bg-zinc-800 text-blue-400 px-2 py-0.5 rounded-md">
                  {dayPlan.dayCalories?.toFixed(0) ?? "—"}
                </code>
              </span>
              <span>
                Protein:{" "}
                <code className="bg-zinc-800 text-blue-400 px-2 py-0.5 rounded-md">
                  {dayPlan.dayProtein?.toFixed(1) ?? "—"}g
                </code>
              </span>
            </div>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {dayPlan.meals.map((meal, idx) => (
              <div key={meal.mealId} className="border-b border-zinc-800 pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">
                      {meal.mealName}
                    </div>
                    <div className="text-xs font-mono text-zinc-400 flex gap-4">
                      <span>
                        <code className="bg-zinc-800 text-blue-400 px-1.5 py-0.5 rounded-md">
                          {meal.totalCalories.toFixed(0)}
                        </code>{" "}
                        cal
                      </span>
                      <span>
                        <code className="bg-zinc-800 text-blue-400 px-1.5 py-0.5 rounded-md">
                          {meal.totalProtein.toFixed(1)}
                        </code>{" "}
                        g protein
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() =>
                        setOverlayState({
                          type: "meal",
                          mealIndex: idx,
                          tab: "ingredients",
                        })
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs px-2 py-1 rounded-md transition cursor-pointer"
                    >
                      Ingredients
                    </button>
                    <button
                      onClick={() =>
                        setOverlayState({
                          type: "meal",
                          mealIndex: idx,
                          tab: "recipe",
                        })
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs px-2 py-1 rounded-md transition cursor-pointer"
                    >
                      Recipe
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
