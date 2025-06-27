"use client";

import { MealCardList } from "./MealCardList";
import { CloseButton } from "@/components/CloseButton";
import { CheckCircle, Circle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Meal } from "./useMealBrainstormChat";
import NextStepButton from "@/components/NextStepButton";

interface MealSidebarProps {
  meals: Meal[];
  onApprove: (meal: Meal) => void;
  onUnapprove: (meal: Meal) => void;
  onRemove: (index: number) => void;
  isMobileVisible: boolean;
  onCloseMobile: () => void;
}

export function MealSidebar({
  meals,
  onApprove,
  onUnapprove,
  onRemove,
  isMobileVisible,
  onCloseMobile,
}: MealSidebarProps) {
  const targetMealCount = 5;
  const approvedMeals = useAppStore(
    (s) => s.stepThreeData?.approvedMeals ?? []
  );
  const approvedCount = approvedMeals.length;
  const isComplete = approvedCount >= targetMealCount;
  const progressPercent = Math.min(
    (approvedCount / targetMealCount) * 100,
    100
  );

  const goToNextSubstep = () => {
    console.log("Next step triggered");
  };

  return (
    <aside
      className={`fixed sm:static top-0 right-0 h-full sm:h-auto bg-black w-[90%] sm:w-[400px] z-50 transition-transform duration-300 ease-in-out border-l border-zinc-700 shadow-xl ${
        isMobileVisible ? "translate-x-0" : "translate-x-full"
      } sm:translate-x-0`}
    >
      <div className="flex flex-col h-full sm:h-auto">
        {/* Mobile header row */}
        <div className="sm:hidden flex items-center justify-between px-4 pt-4 mb-2">
          <h2 className="text-xl font-semibold text-white">Meal Approval</h2>
          <CloseButton onClick={onCloseMobile} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 p-4 overflow-y-auto sm:h-auto">
          <h2 className="hidden sm:block text-xl font-semibold mb-4 text-white">
            Meal Approval
          </h2>

          <MealCardList
            meals={meals}
            onApprove={onApprove}
            onUnapprove={onUnapprove}
            onRemove={onRemove}
          />
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-zinc-900 px-4 pt-3 pb-5 border-t border-zinc-700">
          {/* Progress bar */}
          <div className="relative w-full h-2 bg-zinc-700 rounded-full overflow-hidden mb-3">
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Approval + Status */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-white text-sm font-medium">
              {approvedCount} / {targetMealCount} Meals Approved
            </p>

            <div className="flex items-center gap-2 text-xs mt-0.5">
              {isComplete ? (
                <CheckCircle className="text-blue-500 w-4 h-4" />
              ) : (
                <Circle className="text-gray-500 w-4 h-4" />
              )}
              <span
                className={`font-mono tracking-wide ${
                  isComplete ? "text-blue-400" : "text-gray-500"
                }`}
              >
                {isComplete ? "Complete" : "Not Complete"}
              </span>
            </div>

            {isComplete && (
              <div className="mt-3">
                <NextStepButton href="/step-three-planner/meal-brainstorm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
