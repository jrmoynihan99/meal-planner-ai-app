"use client";

import WeeklyGrid from "./WeeklyGrid";
import VerticalList from "./VerticalList";
import { useAppStore, defaultStepThreeData } from "@/lib/store";
import { useViewMode } from "./ViewModeContext";
import { useState } from "react";
import { ThreeTabMealModal } from "./ThreeTabMealModal";
import { GroceryCartSidebar } from "./GroceryCartSidebar";
import type { DayPlan } from "@/lib/store";
import { Shuffle } from "lucide-react";
import { FloatingButton } from "./FloatingButton";
import {
  updateWeeklyScheduleForVariety,
  getAllCombosForVariety,
} from "@/utils/updateWeeklySchedule";
import { PlanEditBar } from "./PlanEditBar";
import { ComboPicker } from "./ComboPicker";

export default function YourPlanPage() {
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const stepThreeData = useAppStore((s) => s.stepThreeData);

  const { isVerticalView } = useViewMode();

  const allPlanOneDays = stepThreeData?.allPlanOneDays ?? [];
  const allPlanTwoDays = stepThreeData?.allPlanTwoDays ?? [];
  const allPlanThreeDays = stepThreeData?.allPlanThreeDays ?? [];
  const variety = stepThreeData?.variety || "some";
  const shuffleIndices =
    stepThreeData?.shuffleIndices || defaultStepThreeData.shuffleIndices;
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const lockedMeals = stepThreeData?.lockedMeals ?? {};
  const mealsPerDay = useAppStore((s) => s.stepThreeData?.mealsPerDay || 3);

  const weeklySchedule = stepThreeData?.weeklySchedule || {
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null,
  };

  const combos = getAllCombosForVariety(
    allPlanOneDays,
    allPlanTwoDays,
    allPlanThreeDays,
    variety,
    mealsPerDay,
    lockedMeals
  );
  const totalCombos = combos.length;
  const currentComboIdx = shuffleIndices.weeklySchedule?.[variety] ?? 0;

  const [editBarOpen, setEditBarOpen] = useState(false);

  function handlePrevCombo() {
    console.log("[DEBUG] handlePrevCombo called");
    updateWeeklyScheduleForVariety(
      variety,
      allPlanOneDays,
      allPlanTwoDays,
      allPlanThreeDays,
      shuffleIndices,
      setStepThreeData,
      mealsPerDay,
      "shuffle_back",
      lockedMeals
    );
  }

  function handleNextCombo() {
    console.log("[DEBUG] handleNextCombo called");
    updateWeeklyScheduleForVariety(
      variety,
      allPlanOneDays,
      allPlanTwoDays,
      allPlanThreeDays,
      shuffleIndices,
      setStepThreeData,
      mealsPerDay,
      "shuffle",
      lockedMeals
    );
  }

  const [selectedMeal, setSelectedMeal] = useState<
    DayPlan["meals"][number] | null
  >(null);

  // LOADING
  if (!hasHydrated || !stepThreeData || !stepThreeData.weeklySchedule) {
    return (
      <div className="flex h-full w-full bg-black text-white justify-center items-center">
        <span className="text-gray-400 animate-pulse text-lg">
          Loading your plan...
        </span>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-black">
      {isVerticalView ? (
        <VerticalList
          weeklySchedule={weeklySchedule}
          onMealClick={setSelectedMeal}
          isEditing={editBarOpen}
        />
      ) : (
        <WeeklyGrid
          weeklySchedule={weeklySchedule}
          onMealClick={setSelectedMeal}
          isEditing={editBarOpen}
        />
      )}

      {selectedMeal && (
        <ThreeTabMealModal
          isOpen={true}
          scaledMeal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      )}

      {/* Shuffle floating button, always shown unless PlanEditBar is open */}
      {!editBarOpen && (
        <FloatingButton
          icon={<Shuffle size={28} />}
          onClick={() => setEditBarOpen(true)}
          ariaLabel="Edit Plan"
          className="fixed z-30 bottom-6 right-6 border-2 border-blue-500 text-blue-500 bg-black hover:bg-zinc-800 cursor-pointer"
        />
      )}

      {/* Plan Edit Bar (shows both VarietyDropdown and ComboPicker) */}
      <PlanEditBar
        isOpen={editBarOpen}
        onClose={() => setEditBarOpen(false)}
        allPlanOneDays={allPlanOneDays}
        allPlanTwoDays={allPlanTwoDays}
        allPlanThreeDays={allPlanThreeDays}
      >
        <ComboPicker
          currentIdx={currentComboIdx}
          total={totalCombos}
          onPrev={handlePrevCombo}
          onNext={handleNextCombo}
        />
      </PlanEditBar>

      <GroceryCartSidebar />
    </div>
  );
}
