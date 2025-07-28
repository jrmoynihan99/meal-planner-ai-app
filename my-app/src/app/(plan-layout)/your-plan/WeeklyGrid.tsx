"use client";

import { useEffect, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import MealCard from "./MealCard";
import { CALENDAR_CONFIG, DAYS, timeUtils } from "./calendarConfig";
import { useMealDrag } from "./useMealDrag";
import type { DayOfWeek, DayPlan } from "@/lib/store";
import { useAppStore } from "@/lib/store";

interface WeeklyGridProps {
  weeklySchedule: Record<DayOfWeek, DayPlan | null>;
  onMealClick: (meal: DayPlan["meals"][number]) => void;
}

interface DayColumnProps {
  day: DayOfWeek;
  dayPlan: DayPlan | null;
  onMealClick: (meal: DayPlan["meals"][number]) => void;
  headerHeight: number;
}

function DayColumn({
  day,
  dayPlan,
  onMealClick,
  headerHeight,
}: DayColumnProps) {
  const isToday = day === timeUtils.getCurrentDay();
  const timeSlots = timeUtils.getTimeSlots();
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const mealTimes = stepThreeData?.mealTimes || {};
  const totalGridHeight = timeSlots.length * CALENDAR_CONFIG.hourHeight;

  return (
    <div
      className="flex-1 min-w-[180px] border-r border-zinc-800 relative"
      style={{ height: headerHeight + totalGridHeight }}
    >
      {/* Header with day + macro summary inside a single card */}
      <div
        className="border-b-2 border-zinc-600 sticky top-0 bg-black z-10 flex items-center justify-center text-center px-1"
        style={{ height: headerHeight }}
      >
        <div
          className={`rounded-md border shadow-sm w-fit text-[11px] gap-2 flex sm:flex-col items-center sm:items-center justify-center
            ${
              isToday
                ? "bg-blue-900/40 border-blue-700 text-blue-100"
                : "bg-zinc-800/60 border-zinc-700 text-gray-200"
            }`}
          style={{
            height: "54px", // lock card height for mobile
            minHeight: "40px",
            maxHeight: "64px",
            padding: "8px 12px",
            boxSizing: "border-box",
          }}
        >
          <div className="text-[16px] sm:text-sm font-semibold flex-shrink-0 pr-1 sm:pr-0">
            <span className="sm:hidden">{day.charAt(0)}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
          {dayPlan?.meals?.length ? (
            <div className="flex flex-col items-end sm:items-center gap-[2px]">
              <div className="flex items-center gap-1">
                <span className="w-10 text-right">Cals:</span>
                <span className="bg-black/80 text-blue-400 font-mono px-2 py-[2px] rounded-sm border border-blue-500/40">
                  {Math.round(
                    dayPlan.meals.reduce((sum, m) => sum + m.totalCalories, 0)
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-10 text-right">Protein:</span>
                <span className="bg-black/80 text-blue-400 font-mono px-2 py-[2px] rounded-sm border border-blue-500/40">
                  {Math.round(
                    dayPlan.meals.reduce((sum, m) => sum + m.totalProtein, 0)
                  )}
                  g
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Grid lines */}
      <div
        className="absolute inset-x-0"
        style={{ top: headerHeight, height: totalGridHeight }}
      >
        {timeSlots.map((_, index) => (
          <div
            key={index}
            className="border-b border-zinc-700"
            style={{ height: CALENDAR_CONFIG.hourHeight }}
          />
        ))}
      </div>

      {/* Meals */}
      <div className="relative" style={{ height: totalGridHeight }}>
        {dayPlan?.meals?.map((meal, index) => {
          const mealTimeKey = `${day}-${meal.mealId}`;
          const savedTime = mealTimes[mealTimeKey];
          const time = savedTime || timeUtils.getDefaultTime(index);
          const topPosition = timeUtils.getYPosition(time);

          return (
            <MealCard
              key={`${day}-${meal.mealId}`}
              meal={meal}
              dayOfWeek={day}
              onClick={() => onMealClick(meal)}
              style={{
                position: "absolute",
                top: topPosition,
                left: 8,
                right: 8,
                zIndex: 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function WeeklyGrid({
  weeklySchedule,
  onMealClick,
}: WeeklyGridProps) {
  const timeSlots = timeUtils.getTimeSlots();

  const allMeals = DAYS.flatMap(
    (day) => weeklySchedule[day]?.meals?.map((meal) => ({ meal, day })) || []
  );

  const {
    sensors,
    activeId,
    activeMeal,
    activeDayOfWeek,
    scrollOffset,
    handleDragStart,
    handleDragEnd,
  } = useMealDrag(allMeals);

  const [isMobile, setIsMobile] = useState(false);
  const headerHeight = isMobile
    ? CALENDAR_CONFIG.mobileHeaderHeight
    : CALENDAR_CONFIG.headerHeight;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full bg-black overflow-auto">
        {/* Time column with sticky header */}
        <div
          className="bg-black border-r border-zinc-800 flex-shrink-0"
          style={{ width: CALENDAR_CONFIG.timeColumnWidth }}
        >
          <div
            className="border-b-2 border-zinc-600 sticky top-0 bg-black z-10 flex items-center justify-center text-xs text-gray-400"
            style={{ height: headerHeight }}
          ></div>
          <div
            style={{ height: timeSlots.length * CALENDAR_CONFIG.hourHeight }}
          >
            {timeSlots.map(({ hour, label }) => (
              <div
                key={hour}
                className="text-xs text-gray-400 px-2 border-b border-zinc-700 flex items-start pt-1"
                style={{ height: CALENDAR_CONFIG.hourHeight }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Days container */}
        <div className="flex flex-1 min-w-0">
          {DAYS.map((day) => (
            <DayColumn
              key={day}
              day={day}
              dayPlan={weeklySchedule[day]}
              onMealClick={onMealClick}
              headerHeight={headerHeight}
            />
          ))}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay
        dropAnimation={null}
        style={{
          position: "fixed",
          transform: `translateY(${scrollOffset}px)`,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        {activeId && activeMeal && activeDayOfWeek ? (
          <MealCard meal={activeMeal} dayOfWeek={activeDayOfWeek} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
