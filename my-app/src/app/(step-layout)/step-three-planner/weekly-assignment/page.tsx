"use client";

import AutoAssignButton from "./AutoAssignButton";
import ApprovedDaysPanel from "./ApprovedDaysPanel";
import WeeklyGrid from "./WeeklyGrid";
import { useAppStore } from "@/lib/store";
import { DndContext } from "@dnd-kit/core";

export default function WeeklyAssignmentPage() {
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const approvedDays = stepThreeData?.approvedDays || [];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 text-white">
      <div className="p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Assign Your Days
        </h1>
        <p className="text-zinc-400 mb-6">
          Drag your approved meal days onto the week, or use auto assign.
        </p>

        <AutoAssignButton approvedDays={approvedDays} />

        {/* ✅ DndContext must wrap WeeklyGrid + ApprovedDaysPanel */}
        <DndContext>
          <div className="overflow-x-auto">
            <WeeklyGrid approvedDays={approvedDays} />
          </div>

          <ApprovedDaysPanel
            approvedDays={approvedDays.map((day) => ({
              id: day.id,
              title: day.meals.map((m) => m.mealId).join(", "),
              calories: day.dayCalories,
              protein: day.dayProtein,
            }))}
          />
        </DndContext>
      </div>
    </div>
  );
}
