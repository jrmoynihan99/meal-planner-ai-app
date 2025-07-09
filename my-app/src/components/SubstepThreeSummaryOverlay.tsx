"use client";

import { useState } from "react";
import { CloseButton } from "./CloseButton";
import { useAppStore } from "@/lib/store";
import { ChevronDown, ChevronUp, Utensils } from "lucide-react";

interface SubstepThreeSummaryOverlayProps {
  onClose: () => void;
}

export function SubstepThreeSummaryOverlay({
  onClose,
}: SubstepThreeSummaryOverlayProps) {
  const approvedDays = useAppStore((s) => s.stepThreeData?.approvedDays ?? []);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );

  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const approvedMeals = stepThreeData?.approvedMeals ?? [];

  const toggleDropdown = (dayId: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dayId]: !prev[dayId],
    }));
  };

  return (
    <div className="fixed inset-0 z-60 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
      <div className="relative inline-flex">
        {/* Glow Border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm opacity-60 hover:opacity-100 transition-all duration-500 ease-in-out" />

        {/* Content Box */}
        <div className="relative bg-zinc-900 text-white rounded-xl p-6 w-[400px] max-w-full border border-zinc-800 shadow-xl">
          <CloseButton onClick={onClose} className="absolute top-3 right-3" />

          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
            SUBSTEP 3 SUMMARY
          </div>
          <h2 className="text-lg font-semibold mb-4">Approved Days</h2>

          {/* Approved Days List */}
          <div className="space-y-3 text-sm mb-6 max-h-[300px] overflow-y-auto pr-1">
            {approvedDays.length > 0 ? (
              approvedDays.map((day, index) => {
                const isOpen = openDropdowns[day.id];
                return (
                  <div
                    key={day.id}
                    className="border-b border-zinc-800 pb-2 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Day {index + 1}</span>
                      <button
                        onClick={() => toggleDropdown(day.id)}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-white transition cursor-pointer"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>Meals</span>
                        {isOpen ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {isOpen && (
                      <ul className="ml-2 mt-1 space-y-1 text-zinc-300 text-xs font-mono">
                        {day.meals.map((meal, i) => {
                          const name =
                            approvedMeals.find((m) => m.id === meal.mealId)
                              ?.name ?? "Unnamed Meal";
                          return (
                            <li key={meal.mealId} className="truncate">
                              {i + 1}. {name}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-zinc-500 font-mono">No days approved yet.</p>
            )}
          </div>

          {/* Edit Button */}
          <div className="mt-4">
            <a
              href="/step-three-planner/create-days"
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-md transition"
            >
              <Utensils className="w-4 h-4" />
              <span>Edit Approved Days</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
