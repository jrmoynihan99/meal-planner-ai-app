"use client";

import { CloseButton } from "./CloseButton";
import { Pencil } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface SubstepOneSummaryOverlayProps {
  onClose: () => void;
}

export function SubstepOneSummaryOverlay({
  onClose,
}: SubstepOneSummaryOverlayProps) {
  const stepThreeData = useAppStore((state) => state.stepThreeData);
  const mealsPerDay = stepThreeData?.mealsPerDay ?? 0;
  const uniqueWeeklyMeals = stepThreeData?.uniqueWeeklyMeals ?? 0;

  return (
    <div className="fixed inset-0 z-60 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
      <div className="relative inline-flex">
        {/* Glow Border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm opacity-60 hover:opacity-100 transition-all duration-500 ease-in-out" />

        {/* Content Box */}
        <div className="relative bg-zinc-900 text-white rounded-xl p-6 w-[360px] max-w-full border border-zinc-800 shadow-xl">
          <CloseButton onClick={onClose} className="absolute top-3 right-3" />
          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
            Substep 1 Summary
          </div>
          <h2 className="text-lg font-semibold mb-4">Meals Per Day/Week</h2>

          {/* Section: Meal Info */}
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Meals Per Day:</span>
              <span className="bg-zinc-800 px-2 py-1 rounded-md text-blue-400 font-mono text-sm">
                {mealsPerDay > 0 ? mealsPerDay : "—"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Unique Meals Per Week:</span>
              <span className="bg-zinc-800 px-2 py-1 rounded-md text-blue-400 font-mono text-sm">
                {uniqueWeeklyMeals > 0 ? uniqueWeeklyMeals : "—"}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-6">
            <a
              href="/step-three-planner/meal-number"
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-md transition"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Meal Numbers</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
