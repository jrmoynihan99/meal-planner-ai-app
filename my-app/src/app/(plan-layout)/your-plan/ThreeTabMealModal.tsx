"use client";

import { useState, useEffect, useRef } from "react";
import { CloseButton } from "@/components/CloseButton";
import type { DayPlan } from "@/lib/store";

interface ThreeTabMealModalProps {
  scaledMeal: DayPlan["meals"][number];
  isOpen: boolean;
  initialTab?: "details" | "ingredients" | "recipe";
  onClose: () => void;
}

export function ThreeTabMealModal({
  scaledMeal,
  isOpen,
  initialTab = "details",
  onClose,
}: ThreeTabMealModalProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "details" | "ingredients" | "recipe"
  >(initialTab);
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
        <div
          className={`absolute -inset-[1px] rounded-xl blur-sm transition-all duration-500 ease-in-out ${
            isHovered ? "opacity-100" : "opacity-60"
          } bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E]`}
        />

        <div
          ref={modalRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {scaledMeal.mealName}
            </h2>
            <CloseButton onClick={onClose} />
          </div>

          <div className="flex gap-3 mb-5">
            {["details", "ingredients", "recipe"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1.5 text-sm rounded-md font-mono transition ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "details" && (
            <div className="text-sm text-zinc-300 space-y-4">
              {scaledMeal.mealDescription && (
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {scaledMeal.mealDescription}
                </p>
              )}
              <div className="flex gap-6">
                <div>
                  <h3 className="text-zinc-400 text-xs uppercase mb-1">
                    Calories
                  </h3>
                  <code className="bg-zinc-800 text-blue-400 px-2 py-1 rounded-md block w-fit">
                    {scaledMeal.totalCalories.toFixed(0)} kcal
                  </code>
                </div>
                <div>
                  <h3 className="text-zinc-400 text-xs uppercase mb-1">
                    Protein
                  </h3>
                  <code className="bg-zinc-800 text-blue-400 px-2 py-1 rounded-md block w-fit">
                    {scaledMeal.totalProtein.toFixed(1)} g
                  </code>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ingredients" && (
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
          )}

          {activeTab === "recipe" && (
            <ol className="bg-zinc-800 p-4 rounded-md text-sm text-zinc-100 max-h-[300px] overflow-y-auto border border-zinc-700 list-decimal list-inside space-y-2">
              {(scaledMeal.recipe.length > 0
                ? scaledMeal.recipe
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
