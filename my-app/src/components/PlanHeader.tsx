"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, LayoutList, LayoutGrid } from "lucide-react";
import { useGroceryCart } from "@/app/(plan-layout)/your-plan/GroceryCartContext";
import { useViewMode } from "@/app/(plan-layout)/your-plan/ViewModeContext";
import { VarietyDropdown } from "@/components/VarietyDropdown";
import { useAppStore } from "@/lib/store";
import clsx from "clsx";

export function PlanHeader() {
  const [isMobile, setIsMobile] = useState(false);

  const groceryCart = useGroceryCart();
  const viewMode = useViewMode();

  // Zustand state
  const stepThreeData = useAppStore((s) => s.stepThreeData);

  const allPlanOneDays = stepThreeData?.allPlanOneDays ?? [];
  const allPlanTwoDays = stepThreeData?.allPlanTwoDays ?? [];
  const allPlanThreeDays = stepThreeData?.allPlanThreeDays ?? [];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center bg-black px-4 sm:px-8 overflow-visible">
      {/* Left-side empty spacer: only needed on mobile */}
      <div className="flex-shrink-0 w-0 sm:hidden"></div>

      {/* Center/Left: Dropdowns */}
      <div
        className={clsx(
          "flex-1 flex items-center gap-2 sm:gap-3 min-w-0 px-2 sm:px-0",
          // Center on mobile, left-align on desktop
          "justify-center sm:justify-start ml-6 sm:ml-0"
        )}
      >
        <div className="flex-shrink-0">
          <VarietyDropdown
            allPlanOneDays={allPlanOneDays}
            allPlanTwoDays={allPlanTwoDays}
            allPlanThreeDays={allPlanThreeDays}
          />
        </div>
      </div>

      {/* Right side buttons */}
      <div
        className={clsx(
          "flex-shrink-0 flex items-center gap-3 sm:gap-4 z-50",
          isMobile ? "flex-row-reverse" : ""
        )}
      >
        <button
          onClick={groceryCart?.open}
          className="p-2 sm:p-1 text-white hover:text-green-400 transition cursor-pointer touch-manipulation"
          title="Open Grocery List"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
        {isMobile && (
          <button
            onClick={viewMode?.toggleVerticalView}
            className="p-2 sm:p-1 text-white hover:text-blue-400 transition cursor-pointer touch-manipulation"
            title="Toggle Layout"
          >
            {viewMode?.isVerticalView ? (
              <LayoutGrid className="w-5 h-5" />
            ) : (
              <LayoutList className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
