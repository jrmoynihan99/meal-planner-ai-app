"use client";

import { useState } from "react";
import { MealCardList } from "./MealCardList";
import { CloseButton } from "@/components/CloseButton";
import { CheckCircle, Circle, Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Meal } from "@/lib/store";
import NextStepButton from "@/components/NextStepButton";
import clsx from "clsx";

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
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "approved" | "unapproved"
  >("all");

  const targetMealCount =
    useAppStore((s) => s.stepThreeData?.uniqueWeeklyMeals) || 5;
  const approvedMeals = useAppStore(
    (s) => s.stepThreeData?.approvedMeals ?? []
  );
  const approvedCount = approvedMeals.length;
  const isComplete = approvedCount >= targetMealCount;
  const progressPercent = Math.min(
    (approvedCount / targetMealCount) * 100,
    100
  );

  const isMealApproved = (meal: Meal) =>
    approvedMeals.some((m) => m.name.toLowerCase() === meal.name.toLowerCase());

  const filteredMeals =
    selectedFilter === "approved"
      ? meals.filter(isMealApproved)
      : selectedFilter === "unapproved"
      ? [...meals].filter((m) => !isMealApproved(m)).reverse()
      : [...meals].sort((a, b) => {
          const aApproved = isMealApproved(a);
          const bApproved = isMealApproved(b);

          if (aApproved && !bApproved) return 1;
          if (!aApproved && bApproved) return -1;
          return 0;
        });

  const handleGetMoreClick = () => {
    onCloseMobile(); // Close the sidebar on mobile
    const inputEl = document.getElementById(
      "chat-input"
    ) as HTMLTextAreaElement | null;
    if (inputEl) {
      inputEl.focus();
    }
  };

  return (
    <aside
      className={clsx(
        "fixed sm:static top-0 right-0 h-full bg-black w-[90%] sm:w-[400px] z-50 border-l border-zinc-700 shadow-xl transition-transform duration-300 ease-in-out",
        isMobileVisible ? "translate-x-0" : "translate-x-full",
        "sm:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header row */}
        <div className="shrink-0 px-4 pt-4 pb-2 border-b border-zinc-800 bg-black z-10">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center flex-wrap">
              {/* Get More button */}
              <button
                onClick={handleGetMoreClick}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-md font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Get More
              </button>

              {/* Filter pills */}
              {["all", "approved", "unapproved"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFilter(type as any)}
                  className={clsx(
                    "px-3 py-1 text-xs rounded-full border font-mono tracking-wide transition cursor-pointer",
                    selectedFilter === type
                      ? "border-blue-500 text-blue-400 bg-zinc-800"
                      : "border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400"
                  )}
                >
                  {type[0].toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="sm:hidden">
              <CloseButton onClick={onCloseMobile} />
            </div>
          </div>
        </div>

        {/* Scrollable middle section */}
        <div className="flex-1 overflow-y-auto p-4">
          <MealCardList
            meals={filteredMeals}
            onApprove={onApprove}
            onUnapprove={onUnapprove}
            onRemove={onRemove}
          />
        </div>

        {/* Footer - stays at bottom always */}
        <div className="shrink-0 bg-zinc-900 px-4 pt-3 pb-5 border-t border-zinc-700">
          <div className="relative w-full h-2 bg-zinc-700 rounded-full overflow-hidden mb-3">
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

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
                <NextStepButton href="/step-three-planner/create-days" />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
