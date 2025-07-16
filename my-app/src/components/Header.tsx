"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { GeneralInfoOverlay } from "@/components/GeneralInfoOverlay";
import { RotateCcw, LayoutList, LayoutGrid, ShoppingCart } from "lucide-react";
import { OverlayPortal } from "@/components/OverlayPortal";
import { useGroceryCart } from "@/app/(plan-layout)/your-plan/GroceryCartContext";
import { useViewMode } from "@/app/(plan-layout)/your-plan/ViewModeContext"; // ✅ NEW

const routeTitles: Record<string, string> = {
  "/step-one-data": "Input Your Data",
  "/step-two-goal": "Choose Your Goal",
  "/step-three-planner/meal-number": "Meal Number",
  "/step-three-planner/meal-brainstorm": "Choose Meals",
  "/step-three-planner/create-days": "Approve Days",
  "/step-three-planner/weekly-assignment": "Weekly Assignment",
  "/your-plan": "Your Plan",
};

export function Header() {
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Step";
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isYourPlan = pathname === "/your-plan";

  // ✅ Only use hooks when safe
  const groceryCart = isYourPlan ? useGroceryCart() : null;
  const viewMode = isYourPlan ? useViewMode() : null;

  // Zustand step reset handlers
  const resetStepOneData = useAppStore((s) => s.setStepOneData);
  const resetStepTwoData = useAppStore((s) => s.setStepTwoData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  let handleReset = () => {};
  if (pathname === "/step-one-data") {
    handleReset = () => resetStepOneData(null);
  } else if (pathname === "/step-two-goal") {
    handleReset = () => resetStepTwoData(null);
  } else if (pathname === "/step-three-planner/meal-number") {
    handleReset = () =>
      setStepThreeData({ mealsPerDay: 0, uniqueWeeklyMeals: 0 });
  } else if (pathname === "/step-three-planner/meal-brainstorm") {
    handleReset = () => setStepThreeData({ approvedMeals: [] });
  } else if (pathname === "/step-three-planner/create-days") {
    handleReset = () =>
      setStepThreeData({
        allDays: [],
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

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-black px-4 sm:px-8">
      <div className="text-base sm:text-lg font-semibold text-white text-center flex-1">
        {title}
      </div>

      <div
        className={`absolute right-4 top-[10px] flex items-center gap-4 ${
          isMobile ? "flex-row-reverse" : ""
        }`}
      >
        {isYourPlan ? (
          <>
            {/* Shopping Cart */}
            <button
              onClick={groceryCart?.open}
              className="p-1 text-white hover:text-green-400 transition cursor-pointer"
              title="Open Grocery List"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>

            {/* Layout Toggle (mobile only) */}
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
          // Reset icon
          <button
            onClick={() => setShowOverlay(true)}
            className="p-1 text-white hover:text-red-400 transition cursor-pointer"
            title="Reset This Step"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
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
    </header>
  );
}
