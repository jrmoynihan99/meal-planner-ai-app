"use client";

import { useMealDrag } from "./useMealDrag";
import { TimeUtils } from "./timeUtils";
import DroppableArea from "./DroppableArea";
import MealCard from "./MealCard";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import type { DayOfWeek, DayPlan } from "@/lib/store";
import { useAppStore } from "@/lib/store";
import { useViewMode } from "./ViewModeContext";

interface WeekdaySlotProps {
  dayOfWeek: DayOfWeek;
  assignedDay: DayPlan | null;
  onMealClick: (meal: DayPlan["meals"][number]) => void;
  showHeader?: boolean;
  fullWidth?: boolean;
}

export default function WeekdaySlot({
  dayOfWeek,
  assignedDay,
  onMealClick,
  showHeader = false,
  fullWidth = false,
}: WeekdaySlotProps) {
  const meals = assignedDay?.meals ?? [];
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const mealTimes = stepThreeData?.mealTimes || {};
  const { isVerticalView } = useViewMode();
  const timeUtils = new TimeUtils();
  const timeSlots = timeUtils.getTimeSlots();
  const headerOffset = timeUtils.headerOffset;

  const {
    sensors,
    activeId,
    activeMeal,
    scrollOffset,
    handleDragStart,
    handleDragEnd,
  } = useMealDrag(dayOfWeek, meals);

  const todayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  }) as DayOfWeek;

  const isToday = dayOfWeek === todayName;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`${
          fullWidth ? "w-full" : "w-[calc(100vw/4)] sm:w-[220px]"
        } flex flex-col border-r border-zinc-800 relative`}
        style={isVerticalView ? { paddingLeft: "64px" } : undefined}
      >
        {showHeader && (
          <div className="relative h-10 bg-black border-b border-zinc-800 z-10">
            <div
              className={`absolute left-1/2 transform -translate-x-1/2 font-semibold text-sm uppercase text-center transition ${
                isToday
                  ? "bg-zinc-800 border border-zinc-500 text-white"
                  : "text-zinc-400"
              } rounded-full sm:rounded-xl px-2 sm:px-3 py-[2px] sm:py-1 leading-none flex items-center justify-center min-w-[24px] sm:min-w-[60px]`}
            >
              {isVerticalView ? (
                <span>{dayOfWeek}</span>
              ) : (
                <>
                  <span className="sm:hidden">{dayOfWeek.charAt(0)}</span>
                  <span className="hidden sm:inline">{dayOfWeek}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Y-axis time labels for vertical view */}
        {isVerticalView && (
          <div className="absolute left-0 top-0 w-16 flex flex-col text-xs text-gray-400 font-mono z-10 border-r border-zinc-800 bg-black pt-10 pl-4 pr-1">
            {timeSlots.map(({ hour }) => (
              <div
                key={hour}
                className="flex items-start justify-start"
                style={{ height: `${timeUtils.slotHeight}px` }}
              >
                {timeUtils.formatTimeLabel(hour)}
              </div>
            ))}
          </div>
        )}

        {/* Background grid lines */}
        {isVerticalView && (
          <div
            className="absolute left-0 w-full z-0"
            style={{ marginTop: headerOffset }}
          >
            {timeSlots.map((_, index) => (
              <div
                key={index}
                className="border-t border-zinc-800"
                style={{ height: `${timeUtils.slotHeight}px` }}
              />
            ))}
          </div>
        )}

        {/* Meal cards */}
        <DroppableArea dayOfWeek={dayOfWeek}>
          {meals.map((meal, index) => {
            const mealTimeKey = `${dayOfWeek}-${meal.mealId}`;
            const savedTime = mealTimes[mealTimeKey];
            const time = savedTime || timeUtils.getDefaultTime(index);
            const top = timeUtils.getMealCardTopPosition(time);
            const uniqueId = `${dayOfWeek}-${meal.mealId}`;

            return (
              <div
                key={uniqueId}
                className={
                  isVerticalView
                    ? "absolute left-2 right-2"
                    : "absolute left-2 right-2"
                }
                style={isVerticalView ? { top } : { top }}
              >
                <MealCard
                  meal={meal}
                  index={index}
                  dayOfWeek={dayOfWeek}
                  onClick={() => onMealClick(meal)}
                />
              </div>
            );
          })}
        </DroppableArea>
      </div>

      <DragOverlay
        dropAnimation={null}
        style={{
          position: "fixed",
          transform: `translateY(${scrollOffset}px)`,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        {activeId && activeMeal ? (
          <MealCard
            meal={activeMeal}
            index={0}
            dayOfWeek={dayOfWeek}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
