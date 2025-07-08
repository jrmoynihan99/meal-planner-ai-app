"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { GeneralInfoOverlay } from "@/components/GeneralInfoOverlay";
import { Trash2 } from "lucide-react";
import { OverlayPortal } from "@/components/OverlayPortal";

const routeTitles: Record<string, string> = {
  "/step-one-data": "Input Your Data",
  "/step-two-goal": "Choose Your Goal",
  "/step-three-planner/meal-number": "Meal Number",
  "/step-three-planner/meal-brainstorm": "Choose Meals",
  "/step-three-planner/create-days": "Approve Days",
  "/step-three-planner/weekly-plan": "Assign Days to Week",
  "/step-four-results": "Your Plan",
};

export function Header() {
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Step";
  const [showOverlay, setShowOverlay] = useState(false);

  const resetStepOneData = useAppStore((s) => s.setStepOneData);
  const resetStepTwoData = useAppStore((s) => s.setStepTwoData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  let handleReset = () => {};

  // Step 1
  if (pathname === "/step-one-data") {
    handleReset = () => resetStepOneData(null);
  }

  // Step 2
  if (pathname === "/step-two-goal") {
    handleReset = () => resetStepTwoData(null);
  }

  // Step 3 – Substeps
  if (pathname === "/step-three-planner/meal-number") {
    handleReset = () =>
      setStepThreeData({ mealsPerDay: 0, uniqueWeeklyMeals: 0 });
  }

  if (pathname === "/step-three-planner/meal-brainstorm") {
    handleReset = () => setStepThreeData({ approvedMeals: [] });
  }

  if (pathname === "/step-three-planner/create-days") {
    handleReset = () =>
      setStepThreeData({
        allGeneratedDays: [],
        approvedDays: [],
        dayGenerationState: "not_started",
      });
  }

  if (pathname === "/step-three-planner/weekly-plan") {
    handleReset = () =>
      setStepThreeData({
        weeklySchedule: {
          Monday: null,
          Tuesday: null,
          Wednesday: null,
          Thursday: null,
          Friday: null,
          Saturday: null,
          Sunday: null,
        },
      });
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-black px-4 sm:px-8">
      <div className="text-base sm:text-lg font-semibold text-white text-center flex-1">
        {title}
      </div>

      <button
        onClick={() => setShowOverlay(true)}
        className="absolute right-4 top-[10px] p-1 text-white hover:text-red-400 transition cursor-pointer"
        title="Reset This Step"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {showOverlay && (
        <OverlayPortal>
          <GeneralInfoOverlay
            onClose={() => setShowOverlay(false)}
            subheading="Danger Zone"
            title="Reset Step Data"
            description="You are about to reset all data for this step. This action cannot be undone."
            buttonText="Proceed"
            buttonColor="bg-red-600 hover:bg-red-700"
            onButtonClick={() => {
              handleReset();
              setShowOverlay(false);
            }}
          />
        </OverlayPortal>
      )}
    </header>
  );
}
