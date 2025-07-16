"use client";

import { useState } from "react";
import AutoAssignButton from "./AutoAssignButton";
import ApprovedDaysPanel from "./ApprovedDaysPanel";
import WeeklyGrid from "./WeeklyGrid";
import ApprovedDayCard from "./ApprovedDayCard";
import { useAppStore } from "@/lib/store";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import ClearAllButton from "./ClearAllButton";
import CompletePlanButton from "@/components/CompletePlanButton";
import { MealPlanOverlayWrapper } from "./MealPlanOverlayWrapper"; // ✅ NEW

export default function WeeklyAssignmentPage() {
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const approvedDays = stepThreeData?.approvedDays || [];
  const weeklySchedule = stepThreeData?.weeklySchedule || {};
  const allDays = stepThreeData?.allDays || [];
  const approvedMeals = stepThreeData?.approvedMeals || [];

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggedDay = approvedDays.find((d) => d.id === draggingId) || null;

  // ✅ Overlay state
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const selectedDay = allDays.find((d) => d.id === selectedDayId) || null;

  // ✅ All 7 days must be filled (normal or cheat)
  const allDaysFilled = Object.values(weeklySchedule).every(
    (plan) => plan !== null
  );

  return (
    <DndContext
      onDragStart={(event) => setDraggingId(event.active.id as string)}
      onDragEnd={() => setDraggingId(null)}
      onDragCancel={() => setDraggingId(null)}
    >
      <div className="flex flex-col h-full bg-black text-white relative">
        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <AutoAssignButton approvedDays={approvedDays} />
              <ClearAllButton />
            </div>

            <WeeklyGrid
              approvedDays={approvedDays}
              onShowDetails={(id) => setSelectedDayId(id)} // ✅ Pass handler
            />
          </div>
        </div>

        {/* ✅ Sticky CompletePlanButton above ApprovedDaysPanel */}
        <div className="relative">
          {allDaysFilled && (
            <div className="absolute bottom-[20px] right-3 z-50">
              <CompletePlanButton href="/your-plan" />
            </div>
          )}
        </div>

        {/* Sticky footer with scrollable day cards */}
        <ApprovedDaysPanel
          approvedDays={approvedDays}
          onShowDetails={(id) => setSelectedDayId(id)} // ✅ Pass handler here too
        />
      </div>

      {/* DragOverlay ensures visibility while dragging */}
      <DragOverlay dropAnimation={null}>
        {draggedDay && (
          <div style={{ pointerEvents: "none" }}>
            <ApprovedDayCard
              id={draggedDay.id}
              planNumber={draggedDay.planNumber}
              meals={draggedDay.meals}
              calories={draggedDay.dayCalories}
              protein={draggedDay.dayProtein}
              isOverlay
              isDragging
            />
          </div>
        )}
      </DragOverlay>

      {/* ✅ Meal Overlay */}
      {selectedDay && (
        <MealPlanOverlayWrapper
          dayPlan={selectedDay}
          approvedMeals={approvedMeals}
          onClose={() => setSelectedDayId(null)}
        />
      )}
    </DndContext>
  );
}
