"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import type { DayPlan, Meal } from "@/lib/store";
import { MealDetailsModal } from "./MealDetailsModal";
import { SortableMealRow } from "./SortableMealRow";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface DayCardProps {
  day: DayPlan;
  isApproved: boolean;
  onToggleApproval: () => void;
  onReorderMeals: (dayId: string, newOrder: string[]) => void;
}

export default function DayCard({
  day,
  isApproved,
  onToggleApproval,
  onReorderMeals,
}: DayCardProps) {
  const approvedMeals = useAppStore(
    (s) => s.stepThreeData?.approvedMeals || []
  );

  const actualCalories = Math.round(day.dayCalories);
  const actualProtein = Math.round(day.dayProtein);

  const [modalMealMeta, setModalMealMeta] = useState<Meal | null>(null);
  const [modalScaledMeal, setModalScaledMeal] = useState<
    DayPlan["meals"][0] | null
  >(null);
  const [modalTab, setModalTab] = useState<"ingredients" | "recipe">(
    "ingredients"
  );
  const [activeMealId, setActiveMealId] = useState<string | null>(null);

  const openModal = (
    mealId: string,
    tab: "ingredients" | "recipe",
    mealIndex: number
  ) => {
    const fullMeal = approvedMeals.find((m) => m.id === mealId);
    const scaledMeal = day.meals[mealIndex];
    if (fullMeal && scaledMeal) {
      setModalMealMeta(fullMeal);
      setModalScaledMeal(scaledMeal);
      setModalTab(tab);
    }
  };

  const closeModal = () => {
    setModalMealMeta(null);
    setModalScaledMeal(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveMealId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveMealId(null);

    if (active.id !== over?.id) {
      const oldIndex = day.meals.findIndex((m) => m.mealId === active.id);
      const newIndex = day.meals.findIndex((m) => m.mealId === over?.id);
      const reordered = arrayMove(day.meals, oldIndex, newIndex).map(
        (m) => m.mealId
      );
      onReorderMeals(day.id, reordered);
    }
  };

  const activeMeal = activeMealId
    ? day.meals.find((m) => m.mealId === activeMealId)
    : null;
  const activeMealMeta = activeMeal
    ? approvedMeals.find((m) => m.id === activeMeal.mealId)
    : null;

  return (
    <div
      onClick={onToggleApproval}
      className={`relative w-full border rounded-2xl p-4 shadow-md transition-all cursor-pointer ${
        isApproved
          ? "border-blue-500 bg-zinc-900 hover:bg-[#222222]"
          : "border-zinc-700 bg-zinc-900 hover:bg-[#222222]"
      }`}
    >
      {/* Header and macros row - all left aligned */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-zinc-300">
        <h3 className="text-white text-lg font-bold">Day {day.planNumber}</h3>
        <span className="flex items-center gap-2">
          Calories
          <code className="bg-zinc-900 text-green-400 font-mono px-2 py-0.5 rounded-md border border-zinc-700 text-sm">
            {actualCalories}
          </code>
        </span>
        <span className="flex items-center gap-2">
          Protein
          <code className="bg-zinc-900 text-green-400 font-mono px-2 py-0.5 rounded-md border border-zinc-700 text-sm">
            {actualProtein}
          </code>
        </span>
      </div>

      {/* Meals */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={day.meals.map((m) => m.mealId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {day.meals.map((meal, mealIndex) => {
              const fullMeal = approvedMeals.find((m) => m.id === meal.mealId);
              const mealName = fullMeal?.name || `Meal ${mealIndex + 1}`;

              return (
                <SortableMealRow
                  key={meal.mealId}
                  id={meal.mealId}
                  mealName={mealName}
                  totalCalories={Math.round(meal.totalCalories)}
                  totalProtein={Math.round(meal.totalProtein)}
                  onShowDetails={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    openModal(meal.mealId, "ingredients", mealIndex);
                  }}
                  onShowRecipe={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    openModal(meal.mealId, "recipe", mealIndex);
                  }}
                />
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeMealId && activeMeal && activeMealMeta ? (
            <div className="flex items-center px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 shadow-lg opacity-90">
              <div className="w-6 flex justify-center items-center mr-4">
                <GripVertical className="text-zinc-500 w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-base mb-1">
                  {activeMealMeta.name}
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-400 font-medium">
                      Calories
                    </span>
                    <span className="px-1.5 py-0 text-xs rounded-md font-mono bg-zinc-900 text-blue-400 border border-zinc-700">
                      {Math.round(activeMeal.totalCalories)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-400 font-medium">
                      Protein
                    </span>
                    <span className="px-1.5 py-0 text-xs rounded-md font-mono bg-zinc-900 text-blue-400 border border-zinc-700">
                      {Math.round(activeMeal.totalProtein)}g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Approval Toggle - Bottom Right */}
      <div className="flex justify-end mt-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-medium ${
              isApproved ? "text-blue-400" : "text-zinc-400"
            }`}
          >
            {isApproved ? "Approved" : "Not Approved"}
          </span>

          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleApproval();
            }}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              isApproved ? "bg-blue-600" : "bg-zinc-600"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                isApproved ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalMealMeta && modalScaledMeal && (
        <MealDetailsModal
          mealMeta={modalMealMeta}
          scaledMeal={modalScaledMeal}
          isOpen={!!modalMealMeta}
          initialTab={modalTab}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
