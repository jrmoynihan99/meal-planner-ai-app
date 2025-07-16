"use client";

import WeeklyGrid from "./WeeklyGrid";
import VerticalList from "./VerticalList";
import { useAppStore } from "@/lib/store";
import { useViewMode } from "./ViewModeContext";
import { useState } from "react";
import { ThreeTabMealModal } from "./ThreeTabMealModal";
import { GroceryCartSidebar } from "./GroceryCartSidebar";
import type { DayPlan } from "@/lib/store";

export default function YourPlanPage() {
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const { isVerticalView } = useViewMode();

  const weeklySchedule = stepThreeData?.weeklySchedule ?? {
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null,
  };

  const [selectedMeal, setSelectedMeal] = useState<
    DayPlan["meals"][number] | null
  >(null);

  return (
    <div className="h-full w-full overflow-auto relative">
      {isVerticalView ? (
        <VerticalList
          weeklySchedule={weeklySchedule}
          onMealClick={setSelectedMeal}
        />
      ) : (
        <WeeklyGrid
          weeklySchedule={weeklySchedule}
          onMealClick={setSelectedMeal}
        />
      )}

      {selectedMeal && (
        <ThreeTabMealModal
          isOpen={true}
          scaledMeal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      )}

      <GroceryCartSidebar />
    </div>
  );
}
