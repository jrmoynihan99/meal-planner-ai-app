"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { GeneralInfoOverlay } from "@/components/GeneralInfoOverlay";
import { Info, RotateCcw } from "lucide-react";
import { OverlayPortal } from "@/components/OverlayPortal";
import QuestionnaireViewInfoOverlay from "@/components/QuestionnaireViewInfoOverlay";
import MealResultsInfoOverlay from "@/components/MealResultsInfoOverlay";
import StepOneInfoOverlay from "@/components/StepOneInfoOverlay";
import StepTwoInfoOverlay from "@/components/StepTwoInfoOverlay";

const routeTitles: Record<string, string> = {
  "/step-one-data": "Input Your Data",
  "/step-two-goal": "Choose Your Goal",
  "/step-three-planner/meal-brainstorm": "Brainstorm Meals",
  "/step-three-planner/create-days": "Approve Days",
  "/step-three-planner/weekly-assignment": "Weekly Assignment",
};

export function Header() {
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Step";
  const [showOverlay, setShowOverlay] = useState(false);
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);

  const resetStepOneData = useAppStore((s) => s.setStepOneData);
  const resetStepTwoData = useAppStore((s) => s.setStepTwoData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const mealBrainstormState = useAppStore(
    (s) => s.stepThreeData?.mealBrainstormState
  );

  let handleReset = () => {};
  if (pathname === "/step-one-data") {
    handleReset = () => resetStepOneData(null);
  } else if (pathname === "/step-two-goal") {
    handleReset = () => resetStepTwoData(null);
  } else if (pathname === "/step-three-planner/meal-number") {
    handleReset = () =>
      setStepThreeData({ mealsPerDay: 0, uniqueWeeklyMeals: 0 });
  } else if (pathname === "/step-three-planner/meal-brainstorm") {
    handleReset = () =>
      setStepThreeData({
        mealBrainstormState: "not_started",
        mealsPerDay: 0,
        variety: undefined,
        approvedMeals: [],
        savedMeals: [],
        generatedMeals: [],
        ingredientPreferences: {
          proteins: [],
          carbs: [],
          veggies: [],
          likesFruit: true,
          cuisines: [],
          customInput: "",
          customFoods: {
            proteins: [],
            carbs: [],
            veggies: [],
            cuisines: [],
          },
        },
      });
  } else if (pathname === "/step-three-planner/create-days") {
    handleReset = () =>
      setStepThreeData({
        allPlanOneDays: [],
        unapprovedDays: [],
        approvedDays: [],
        dayGenerationState: "not_started",
      });
  } else if (pathname === "/step-three-planner/weekly-assignment") {
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
        skippedDays: [],
      });
  }

  const renderInfoOverlay = () => {
    if (pathname === "/step-one-data")
      return (
        <StepOneInfoOverlay
          onClose={() => setShowInfoOverlay(false)}
          manuallyOpened={true}
        />
      );
    if (pathname === "/step-two-goal")
      return (
        <StepTwoInfoOverlay
          onClose={() => setShowInfoOverlay(false)}
          manuallyOpened={true}
        />
      );
    if (pathname === "/step-three-planner/meal-brainstorm") {
      if (mealBrainstormState === "completed") {
        return (
          <MealResultsInfoOverlay
            onClose={() => setShowInfoOverlay(false)}
            manuallyOpened={true}
          />
        );
      } else {
        return (
          <QuestionnaireViewInfoOverlay
            onClose={() => setShowInfoOverlay(false)}
            manuallyOpened={true}
          />
        );
      }
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-black px-4 sm:px-8">
      <div className="text-base sm:text-lg font-semibold text-white text-center flex-1">
        {title}
      </div>

      <div className="absolute right-4 inset-y-0 my-auto flex items-center gap-4">
        <button
          onClick={() => setShowInfoOverlay(true)}
          className="p-1 text-white hover:text-blue-400 transition cursor-pointer"
          title="Step Info"
        >
          <Info className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowOverlay(true)}
          className="p-1 text-white hover:text-red-400 transition cursor-pointer"
          title="Reset This Step"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

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

      {showInfoOverlay && <OverlayPortal>{renderInfoOverlay()}</OverlayPortal>}
    </header>
  );
}
