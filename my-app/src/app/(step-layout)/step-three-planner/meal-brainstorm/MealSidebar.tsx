// ./MealSidebar.tsx
"use client";

import { useEffect } from "react";
import { MealCardList } from "./MealCardList";
import { CloseButton } from "@/components/CloseButton";

interface MealSidebarProps {
  meals: any[];
  onApprove: (meal: any) => void;
  onTweak: (index: number) => void;
  onReplace: (index: number) => void;
  isMobileVisible: boolean;
  onCloseMobile: () => void;
}

export function MealSidebar({
  meals,
  onApprove,
  onTweak,
  onReplace,
  isMobileVisible,
  onCloseMobile,
}: MealSidebarProps) {
  return (
    <aside
      className={`fixed sm:static top-0 right-0 h-full sm:h-auto bg-zinc-900 w-[90%] sm:w-[400px] z-50 transition-transform duration-300 ease-in-out border-l border-zinc-700 shadow-xl
      ${
        isMobileVisible ? "translate-x-0" : "translate-x-full"
      } sm:translate-x-0`}
    >
      <div className="flex flex-col h-full sm:h-auto">
        {/* Mobile header row */}
        <div className="sm:hidden flex items-center justify-between px-4 pt-4 mb-2">
          <h2 className="text-xl font-semibold text-white">Suggested Meals</h2>
          <CloseButton onClick={onCloseMobile} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 p-4 overflow-y-auto sm:h-auto">
          {/* Desktop title */}
          <h2 className="hidden sm:block text-xl font-semibold mb-4 text-white">
            Suggested Meals
          </h2>

          <MealCardList
            meals={meals}
            onApprove={onApprove}
            onTweak={onTweak}
            onReplace={onReplace}
          />
        </div>
      </div>
    </aside>
  );
}
