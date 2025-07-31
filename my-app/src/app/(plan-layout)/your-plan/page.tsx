"use client";

import WeeklyGrid from "./WeeklyGrid";
import VerticalList from "./VerticalList";
import { useAppStore, defaultStepThreeData } from "@/lib/store";
import { useViewMode } from "./ViewModeContext";
import { useState } from "react";
import { ThreeTabMealModal } from "./ThreeTabMealModal";
import { GroceryCartSidebar } from "./GroceryCartSidebar";
import type { DayPlan } from "@/lib/store";
import { Plus, Shuffle } from "lucide-react";
import { FloatingButton } from "./FloatingButton";
import {
  updateWeeklyScheduleForVariety,
  getAllCombosForVariety,
} from "@/utils/updateWeeklySchedule";

export default function YourPlanPage() {
  // Hydration logic
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const stepThreeData = useAppStore((s) => s.stepThreeData);

  const { isVerticalView } = useViewMode();

  // All possible day plans for each plan
  const allPlanOneDays = stepThreeData?.allPlanOneDays ?? [];
  const allPlanTwoDays = stepThreeData?.allPlanTwoDays ?? [];
  const allPlanThreeDays = stepThreeData?.allPlanThreeDays ?? [];
  const variety = stepThreeData?.variety || "some";
  const shuffleIndices =
    stepThreeData?.shuffleIndices || defaultStepThreeData.shuffleIndices;
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const lockedMeals = stepThreeData?.lockedMeals ?? {};

  const weeklySchedule = stepThreeData?.weeklySchedule || {
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null,
  };

  // Get all possible combos and the current combo index
  const combos = getAllCombosForVariety(
    allPlanOneDays,
    allPlanTwoDays,
    allPlanThreeDays,
    variety,
    lockedMeals
  );
  const totalCombos = combos.length;
  const currentComboIdx = (shuffleIndices.weeklySchedule?.[variety] ?? 0) + 1; // 1-based for user display
  const showShuffle = totalCombos > 1;

  function handleAdd() {
    // Your "add day/meal" logic here
    alert("Add button clicked");
  }

  function handleShuffle() {
    updateWeeklyScheduleForVariety(
      variety,
      allPlanOneDays,
      allPlanTwoDays,
      allPlanThreeDays,
      shuffleIndices,
      setStepThreeData,
      "shuffle",
      lockedMeals
    );
  }

  const [selectedMeal, setSelectedMeal] = useState<
    DayPlan["meals"][number] | null
  >(null);

  // ----------- LOADING SCREEN -----------
  if (
    !hasHydrated ||
    !stepThreeData ||
    !stepThreeData.weeklySchedule
    // Add more checks if necessary (e.g., if you need meals loaded, etc.)
  ) {
    return (
      <div className="flex h-full w-full bg-black text-white justify-center items-center">
        <span className="text-gray-400 animate-pulse text-lg">
          Loading your plan...
        </span>
      </div>
    );
  }

  // ----------- MAIN CONTENT -----------
  return (
    <div className="h-full w-full relative bg-black">
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

      <FloatingButton
        icon={<Plus size={30} />}
        onClick={handleAdd}
        ariaLabel="Add"
        className="fixed z-30 bottom-6 right-6 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
      />

      {showShuffle && (
        <FloatingButton
          icon={
            <div className="flex flex-col items-center">
              <Shuffle size={28} />
              <span className="text-xs font-mono mt-1">
                {currentComboIdx}/{totalCombos}
              </span>
            </div>
          }
          onClick={handleShuffle}
          ariaLabel="Shuffle"
          className="fixed z-30 bottom-6 right-24 border-2 border-blue-500 text-blue-500 bg-black hover:bg-zinc-800 cursor-pointer"
        />
      )}

      <GroceryCartSidebar />
    </div>
  );
}
