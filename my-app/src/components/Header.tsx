"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { GeneralInfoOverlay } from "@/components/GeneralInfoOverlay";
import {
  Info,
  RotateCcw,
  LayoutList,
  LayoutGrid,
  ShoppingCart,
} from "lucide-react";
import { OverlayPortal } from "@/components/OverlayPortal";
import { useGroceryCart } from "@/app/(plan-layout)/your-plan/GroceryCartContext";
import { useViewMode } from "@/app/(plan-layout)/your-plan/ViewModeContext";
import QuestionnaireViewInfoOverlay from "@/components/QuestionnaireViewInfoOverlay";
import MealResultsInfoOverlay from "@/components/MealResultsInfoOverlay";
import StepOneInfoOverlay from "@/components/StepOneInfoOverlay";
import StepTwoInfoOverlay from "@/components/StepTwoInfoOverlay";
import clsx from "clsx";

const routeTitles: Record<string, string> = {
  "/step-one-data": "Input Your Data",
  "/step-two-goal": "Choose Your Goal",
  "/step-three-planner/meal-brainstorm": "Brainstorm Meals",
  "/step-three-planner/create-days": "Approve Days",
  "/step-three-planner/weekly-assignment": "Weekly Assignment",
  "/your-plan": "Your Plan",
};

export function Header() {
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Step";
  const [showOverlay, setShowOverlay] = useState(false);
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isYourPlan = pathname === "/your-plan";

  const groceryCart = isYourPlan ? useGroceryCart() : null;
  const viewMode = isYourPlan ? useViewMode() : null;

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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

      <div
        className={clsx(
          "absolute right-4 inset-y-0 my-auto flex items-center gap-4",
          isMobile && isYourPlan ? "flex-row-reverse" : ""
        )}
      >
        {isYourPlan ? (
          <>
            <button
              onClick={groceryCart?.open}
              className="p-1 text-white hover:text-green-400 transition cursor-pointer"
              title="Open Grocery List"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            {isMobile && (
              <button
                onClick={viewMode?.toggleVerticalView}
                className="p-1 text-white hover:text-blue-400 transition cursor-pointer"
                title="Toggle Layout"
              >
                {viewMode?.isVerticalView ? (
                  <LayoutGrid className="w-5 h-5" />
                ) : (
                  <LayoutList className="w-5 h-5" />
                )}
              </button>
            )}
          </>
        ) : (
          <>
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
          </>
        )}
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
