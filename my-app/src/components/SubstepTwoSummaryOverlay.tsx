"use client";

import { CloseButton } from "./CloseButton";
import { Pencil } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface SubstepTwoSummaryOverlayProps {
  onClose: () => void;
}

export function SubstepTwoSummaryOverlay({
  onClose,
}: SubstepTwoSummaryOverlayProps) {
  const stepThreeData = useAppStore((state) => state.stepThreeData);
  const approvedMeals = stepThreeData?.approvedMeals ?? [];
  const uniqueWeeklyMeals = stepThreeData?.uniqueWeeklyMeals ?? 0;

  const approvedCount = approvedMeals.length;
  const progressPercent = uniqueWeeklyMeals
    ? Math.min((approvedCount / uniqueWeeklyMeals) * 100, 100)
    : 0;

  const totalSpots = uniqueWeeklyMeals || 0;

  return (
    <div className="fixed inset-0 z-60 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
      <div className="relative inline-flex">
        {/* Glow Border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm opacity-60 hover:opacity-100 transition-all duration-500 ease-in-out" />

        {/* Content Box */}
        <div className="relative bg-zinc-900 text-white rounded-xl p-6 w-[400px] max-w-full border border-zinc-800 shadow-xl">
          <CloseButton onClick={onClose} className="absolute top-3 right-3" />
          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
            Substep 2 Summary
          </div>
          <h2 className="text-lg font-semibold mb-4">Approved Meals</h2>

          {/* Approved Meal List */}
          <div className="space-y-3 text-sm mb-6 max-h-[300px] overflow-y-auto pr-1">
            {approvedMeals.length > 0 ? (
              approvedMeals.map((meal, index) => (
                <div
                  key={meal.id || index}
                  className="flex justify-between items-center border-b border-zinc-800 pb-2"
                >
                  <span className="text-zinc-400 truncate">{meal.name}</span>
                  <span className="bg-zinc-800 px-2 py-1 rounded-md text-blue-400 font-mono text-sm">
                    #{index + 1}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 font-mono">No meals approved yet.</p>
            )}
          </div>

          {/* Progress bar */}
          {uniqueWeeklyMeals > 0 && (
            <div className="mb-4">
              <div className="relative w-full h-2 bg-zinc-700 rounded-full overflow-hidden mb-2">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-in-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-center text-xs text-zinc-400 font-mono">
                {approvedCount} / {uniqueWeeklyMeals} Meals Approved
              </p>
            </div>
          )}

          {/* Edit Button */}
          <div className="mt-4">
            <a
              href="/step-three-planner/meal-brainstorm"
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-md transition"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Approved Meals</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
