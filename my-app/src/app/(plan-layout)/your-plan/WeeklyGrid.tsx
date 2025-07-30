"use client";

import { useEffect, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import MealCard from "./MealCard";
import { CALENDAR_CONFIG, DAYS, timeUtils } from "./calendarConfig";
import { useMealDrag } from "./useMealDrag";
import type { DayOfWeek, DayPlan } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

interface WeeklyGridProps {
  weeklySchedule: Record<DayOfWeek, DayPlan | null>;
  onMealClick: (meal: DayPlan["meals"][number]) => void;
}

interface DayColumnProps {
  day: DayOfWeek;
  dayPlan: DayPlan | null;
  onMealClick: (meal: DayPlan["meals"][number]) => void;
}

function DayColumn({ day, dayPlan, onMealClick }: DayColumnProps) {
  const timeSlots = timeUtils.getTimeSlots();
  const totalGridHeight = timeSlots.length * CALENDAR_CONFIG.hourHeight;

  return (
    <div className="flex-1 min-w-[180px] border-r border-zinc-800 relative">
      {/* Grid lines */}
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: totalGridHeight }}
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
        <AnimatePresence mode="popLayout">
          {dayPlan?.meals?.map((meal, index) => {
            const time = meal.mealTime || "12:00";
            const topPosition = timeUtils.getYPosition(time);

            return (
              <motion.div
                key={`${day}-${meal.mealId}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.06,
                  ease: [0.42, 0, 0.58, 1],
                }}
                style={{
                  position: "absolute",
                  top: topPosition,
                  left: 8,
                  right: 8,
                  zIndex: 1,
                }}
              >
                <MealCard
                  meal={meal}
                  dayOfWeek={day}
                  slotIdx={index}
                  onClick={() => onMealClick(meal)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
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

  // Calculate minimum width for full header border
  const minContentWidth = CALENDAR_CONFIG.timeColumnWidth + DAYS.length * 180; // 180px is min-width per day column

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
      <div className="flex flex-col h-full bg-black">
        {/* Main container - horizontally scrollable */}
        <div className="flex flex-col flex-1 overflow-auto">
          {/* Header section - now inside scrollable container */}
          <div
            className="bg-black flex-shrink-0 sticky top-0 z-10 relative"
            style={{ height: headerHeight }}
          >
            {/* Border that extends full width */}
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-zinc-600"
              style={{ width: minContentWidth }}
            />
            <div className="flex" style={{ minWidth: minContentWidth }}>
              {/* Time column header - sticky with higher z-index */}
              <div
                className="bg-black border-r-2 border-zinc-600 flex items-center justify-center text-xs text-gray-400 flex-shrink-0 sticky left-0 z-30"
                style={{ width: CALENDAR_CONFIG.timeColumnWidth }}
              ></div>

              {/* Day headers */}
              {DAYS.map((day) => {
                const isToday = day === timeUtils.getCurrentDay();
                const dayPlan = weeklySchedule[day];

                return (
                  <div
                    key={day}
                    className="flex-1 min-w-[180px] border-r border-zinc-800 flex flex-col items-center justify-center text-center px-1"
                  >
                    {/* Day of week (no card) */}
                    <div className="text-[16px] sm:text-sm font-semibold flex-shrink-0 mb-1 drop-shadow">
                      {/* Mobile: circle */}
                      <span className="sm:hidden">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full
                  transition-all duration-200
                  ${
                    isToday
                      ? "bg-blue-500 text-white shadow"
                      : "bg-zinc-900 text-blue-100"
                  }`}
                        >
                          {day.charAt(0)}
                        </span>
                      </span>
                      {/* Desktop: pill */}
                      <span className="hidden sm:inline">
                        <span
                          className={`inline-block px-3 py-1 rounded-full
                  transition-all duration-200
                  ${
                    isToday
                      ? "bg-blue-500 text-white shadow"
                      : "bg-zinc-900 text-blue-100"
                  }`}
                        >
                          {day}
                        </span>
                      </span>
                    </div>

                    {/* Cals & Protein inline in a filled, rounded card */}
                    {dayPlan?.meals?.length ? (
                      <div
                        className="flex flex-row items-center justify-center gap-1 px-2.5 py-1
                rounded-2xl bg-zinc-800/80 shadow-sm border border-zinc-700
                text-[11px] font-medium text-blue-100"
                        style={{
                          minHeight: "32px",
                          marginBottom: "2px",
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-gray-300">Cals:</span>
                          <span className="font-mono text-blue-300 bg-zinc-900/80 px-1 py-[1px] rounded-md border border-blue-500/20">
                            {Math.round(
                              dayPlan.meals.reduce(
                                (sum, m) => sum + m.totalCalories,
                                0
                              )
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-300">Prot:</span>
                          <span className="font-mono text-blue-300 bg-zinc-900/80 px-1 py-[1px] rounded-md border border-blue-500/20">
                            {Math.round(
                              dayPlan.meals.reduce(
                                (sum, m) => sum + m.totalProtein,
                                0
                              )
                            )}
                            g
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar grid content */}
          <div
            className="flex flex-1 relative"
            style={{ minWidth: minContentWidth }}
          >
            {/* Sticky Time column */}
            <div
              className="bg-black border-r-2 border-zinc-600 flex-shrink-0 sticky left-0 z-20"
              style={{ width: CALENDAR_CONFIG.timeColumnWidth }}
            >
              <div
                style={{
                  height: timeSlots.length * CALENDAR_CONFIG.hourHeight,
                }}
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
                />
              ))}
            </div>
          </div>
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
          <MealCard
            meal={activeMeal}
            dayOfWeek={activeDayOfWeek}
            slotIdx={0} // Or whatever slotIdx makes sense (optional for overlay)
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
