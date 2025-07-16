"use client";

import { useState, useEffect, useRef } from "react";
import { CloseButton } from "@/components/CloseButton";
import type { Meal } from "@/lib/store";

interface ScaledIngredient {
  name: string;
  grams: number;
  protein: number;
  calories: number;
  amount?: string; // ✅ New
}

interface ScaledMeal {
  ingredients: ScaledIngredient[];
}

interface MealDetailsModalProps {
  mealMeta: Meal; // from approvedMeals
  scaledMeal: ScaledMeal; // from DayPlan.meals[]
  isOpen: boolean;
  initialTab: "ingredients" | "recipe";
  onClose: () => void;
  onBack?: () => void; // ✅ Optional back button
}

export function MealDetailsModal({
  mealMeta,
  scaledMeal,
  isOpen,
  initialTab,
  onClose,
  onBack,
}: MealDetailsModalProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<"ingredients" | "recipe">(
    initialTab
  );
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-6">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative inline-flex w-full max-w-lg"
      >
        {/* Glow Border */}
        <div
          className={`absolute -inset-[1px] rounded-xl blur-sm transition-all duration-500 ease-in-out ${
            isHovered ? "opacity-100" : "opacity-60"
          } bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E]`}
        />

        {/* Content Box */}
        <div
          ref={modalRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6"
        >
          {/* Top Bar */}
          <div className="flex justify-between items-start mb-2">
            {onBack ? (
              <button
                onClick={onBack}
                className="text-blue-400 hover:text-white text-sm font-mono cursor-pointer"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}
            <CloseButton onClick={onClose} />
          </div>

          {/* Title */}
          <h2
            className={`text-lg font-semibold text-white mb-4 ${
              onBack ? "mt-2" : ""
            }`}
          >
            {mealMeta.name}
          </h2>

          {/* Tabs */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setActiveTab("ingredients")}
              className={`px-3 py-1.5 text-sm rounded-md font-mono transition ${
                activeTab === "ingredients"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab("recipe")}
              className={`px-3 py-1.5 text-sm rounded-md font-mono transition ${
                activeTab === "recipe"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
              }`}
            >
              Recipe
            </button>
          </div>

          {/* Content */}
          {activeTab === "ingredients" ? (
            <div className="text-sm text-zinc-300 max-h-[300px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-700">
                    <th className="py-1 pr-2">Ingredient</th>
                    <th className="py-1 pr-2">Amount</th>
                    <th className="py-1 pr-2">Protein</th>
                    <th className="py-1">Calories</th>
                  </tr>
                </thead>
                <tbody>
                  {scaledMeal.ingredients.map((ing, i) => (
                    <tr key={i} className="border-b border-zinc-800">
                      <td className="py-1 pr-2 text-white">{ing.name}</td>
                      <td className="py-1 pr-2">
                        {ing.amount ?? `${ing.grams}g`}
                      </td>
                      <td className="py-1 pr-2">
                        {ing.protein?.toFixed(1) ?? "-"}
                      </td>
                      <td className="py-1">
                        {ing.calories?.toFixed(0) ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ol className="bg-zinc-800 p-4 rounded-md text-sm text-zinc-100 max-h-[300px] overflow-y-auto border border-zinc-700 list-decimal list-inside space-y-2">
              {(mealMeta.recipe.length > 0
                ? mealMeta.recipe
                : ["No recipe provided."]
              ).map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
