"use client";

import { useDraggable } from "@dnd-kit/core";
import type { DayPlan, DayOfWeek } from "@/lib/store";
import { RefreshCw, Info } from "lucide-react";
import { useViewMode } from "./ViewModeContext";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";

interface MealCardProps {
  meal: DayPlan["meals"][number];
  dayOfWeek: DayOfWeek;
  isDragging?: boolean;
  onClick?: () => void;
  variant?: "grid" | "list";
  style?: React.CSSProperties;
}

export default function MealCard({
  meal,
  dayOfWeek,
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
    disabled: variant === "list", // Disable dragging in list view
  });

  const { isVerticalView } = useViewMode();
  const mealTimes = useAppStore((s) => s.stepThreeData?.mealTimes || {});

  // Detect mobile screen width
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

  const iconSize = isVerticalView ? 18 : 16;
  const textSizeClass = isVerticalView ? "text-[12px]" : "text-[11px]";

  // List variant for VerticalList component
  if (variant === "list") {
    // 🟦 Use a default time as fallback
    const mealTimeKey = `${dayOfWeek}-${meal.mealId}`;
    const defaultTimes = ["07:00", "12:00", "18:00"];
    const fallbackTime = defaultTimes[0] || "12:00"; // You can adjust the index logic

    const time = mealTimes[mealTimeKey] || fallbackTime;

    return (
      <div className="cursor-pointer" onClick={onClick} style={combinedStyle}>
        <div
          className="relative rounded-lg px-3 py-3 flex items-center justify-between
                     hover:shadow-lg hover:scale-[1.02] 
                     active:scale-95 transition-transform duration-200 ease-out"
          style={{
            backgroundColor: meal.color ?? "#4F81BD",
            color: "#111",
          }}
        >
          {/* Left side - Meal name and time */}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-black truncate">
              {meal.mealName}
            </span>
            {/* 🟦 Fixed: Use mealTimes from hook */}
            <span className="text-xs text-black/70">{time}</span>
          </div>

          {/* Right side - Nutrition and icons */}
          <div className="flex items-center gap-4">
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
              <Info
                size={18}
                className="text-black cursor-pointer hover:text-white/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Details clicked");
                }}
              />
              <RefreshCw
                size={18}
                className="text-black cursor-pointer hover:text-white/80 transition-colors"
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
            <Info
              size={iconSize}
              className="text-black cursor-pointer hover:text-white/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Details clicked");
              }}
            />
            <RefreshCw
              size={iconSize}
              className="text-black cursor-pointer hover:text-white/80 transition-colors"
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
