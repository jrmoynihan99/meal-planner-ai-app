// ./MealSidebar.tsx
"use client";

import { MealCardList } from "./MealCardList";
import { XIcon } from "lucide-react";

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
      className={`fixed sm:static top-0 right-0 h-full sm:h-auto bg-zinc-900 w-[90%] sm:w-[350px] z-50 transition-transform duration-300 ease-in-out border-l border-zinc-700 shadow-xl
      ${
        isMobileVisible ? "translate-x-0" : "translate-x-full"
      } sm:translate-x-0`}
    >
      {/* Mobile close button */}
      <div className="sm:hidden flex justify-end p-4">
        <button onClick={onCloseMobile}>
          <XIcon className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="p-4 overflow-y-auto h-full sm:h-auto">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Suggested Meals
        </h2>
        <MealCardList
          meals={meals}
          onApprove={onApprove}
          onTweak={onTweak}
          onReplace={onReplace}
        />
      </div>
    </aside>
  );
}
