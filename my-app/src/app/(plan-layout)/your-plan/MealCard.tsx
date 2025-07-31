"use client";

import { useDraggable } from "@dnd-kit/core";
import type { DayPlan, DayOfWeek } from "@/lib/store";
import { Shuffle, Lock, Unlock } from "lucide-react";
import { useViewMode } from "./ViewModeContext";
import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";

// --- YOU SHOULD PASS slotIdx as a prop for maximum reliability!
interface MealCardProps {
  meal: DayPlan["meals"][number];
  dayOfWeek: DayOfWeek;
  slotIdx: number; // <--- new: slot index of this meal in the day's array!
  isDragging?: boolean;
  onClick?: () => void;
  variant?: "grid" | "list";
  style?: React.CSSProperties;
}

export default function MealCard({
  meal,
  dayOfWeek,
  slotIdx,
  isDragging = false,
  onClick,
  variant = "grid",
  style,
}: MealCardProps) {
  const uniqueId = `${dayOfWeek}-${meal.mealId}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isBeingDragged,
  } = useDraggable({
    id: uniqueId,
    disabled: variant === "list",
  });

  const { isVerticalView } = useViewMode();

  // Get lock state from Zustand
  const lockedMeals = useAppStore((s) => s.stepThreeData?.lockedMeals);
  const setLockedMeal = useAppStore((s) => s.setLockedMeal);
  const unsetLockedMeal = useAppStore((s) => s.unsetLockedMeal);

  const isLocked = (lockedMeals?.[slotIdx] ?? null) === meal.mealId;

  // (Optional) - if you want to auto-update schedule after lock/unlock, use the appropriate callback here!

  // Detect mobile screen width (unchanged)
  const [, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const transformStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const combinedStyle = { ...style, ...transformStyle };
  const iconSize = isVerticalView ? 20 : 18;
  const textSizeClass = isVerticalView ? "text-[12px]" : "text-[11px]";

  // List variant for VerticalList component
  if (variant === "list") {
    const time = meal.mealTime || "12:00";
    return (
      <div className="cursor-pointer" onClick={onClick} style={combinedStyle}>
        <div
          className="relative rounded-lg px-3 py-3 flex items-center
            hover:shadow-lg hover:scale-[1.02] 
            active:scale-95 transition-transform duration-200 ease-out"
          style={{
            backgroundColor: meal.color ?? "#4F81BD",
            color: "#111",
          }}
        >
          {/* Row layout: Meal name/time takes all available space, right elements never shrink */}
          <div className="flex items-center w-full min-w-0">
            {/* Meal name & time column */}
            <div className="flex flex-col flex-1 min-w-0">
              <span
                className="
                  font-bold text-black truncate
                  text-xs sm:text-sm
                  min-w-0
                "
                title={meal.mealName}
              >
                {meal.mealName}
              </span>
              <span className="text-xs text-black/70">{time}</span>
            </div>

            {/* Nutrition & icons */}
            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-black">Cal</span>
                  <span className="bg-white/40 text-black font-mono px-2 py-1 rounded">
                    {Math.round(meal.totalCalories)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-black">Prot</span>
                  <span className="bg-white/40 text-black font-mono px-2 py-1 rounded">
                    {Math.round(meal.totalProtein)}g
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLocked ? (
                  <Lock
                    size={iconSize}
                    className="cursor-pointer text-blue-600 hover:text-white/60 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      unsetLockedMeal(slotIdx);
                    }}
                  />
                ) : (
                  <Unlock
                    size={iconSize}
                    className="cursor-pointer text-black hover:text-white/60 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLockedMeal(slotIdx, meal.mealId);
                    }}
                  />
                )}
                <Shuffle
                  size={iconSize}
                  className="text-black cursor-pointer hover:text-white/60 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Swap clicked");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={combinedStyle}
      className={`mb-2 cursor-pointer ${
        isBeingDragged ? "opacity-50 z-30" : ""
      } ${isDragging ? "rotate-2 shadow-2xl" : ""}`}
      onClick={onClick}
    >
      <div
        className="relative rounded-xl px-1 py-1 h-[68px] flex flex-col justify-between
                   hover:shadow-lg hover:scale-[1.02] 
                   active:scale-95 transition-transform duration-200 ease-out"
        style={{
          backgroundColor: meal.color ?? "#4F81BD",
          color: "#111",
        }}
      >
        {/* Meal Name */}
        <span
          className="text-[11px] font-bold text-black truncate max-w-[100%] px-1"
          title={meal.mealName}
        >
          {meal.mealName}
        </span>

        {/* Bottom Row */}
        <div
          className={`flex justify-between items-end px-1 mt-auto pb-1 ${textSizeClass}`}
        >
          {/* Calories and Protein */}
          {isVerticalView ? (
            <div className="flex items-center gap-2">
              <span className="text-black">Cal</span>
              <span className="bg-white/40 text-black font-mono px-1.5 rounded-sm leading-tight">
                {Math.round(meal.totalCalories)}
              </span>
              <span className="text-black">Prot</span>
              <span className="bg-white/40 text-black font-mono px-1.5 rounded-sm leading-tight">
                {Math.round(meal.totalProtein)}g
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-[2px]">
              <div className="flex items-center gap-1">
                <span className="text-black">Cal</span>
                <span className="bg-white/40 text-black font-mono px-1 rounded-sm leading-tight">
                  {Math.round(meal.totalCalories)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-black">Prot</span>
                <span className="bg-white/40 text-black font-mono px-1 rounded-sm leading-tight">
                  {Math.round(meal.totalProtein)}g
                </span>
              </div>
            </div>
          )}

          {/* Icons */}
          <div className="flex items-center gap-2 pr-1 pb-[2px]">
            {isLocked ? (
              <Lock
                size={iconSize}
                className="cursor-pointer text-blue-600 hover:text-white/60 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  unsetLockedMeal(slotIdx);
                }}
              />
            ) : (
              <Unlock
                size={iconSize}
                className="cursor-pointer text-black hover:text-white/60 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLockedMeal(slotIdx, meal.mealId);
                }}
              />
            )}
            <Shuffle
              size={iconSize}
              className="text-black cursor-pointer hover:text-white/60 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Swap clicked");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
