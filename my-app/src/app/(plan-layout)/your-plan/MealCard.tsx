// MealCard.tsx
"use client";

import { useDraggable } from "@dnd-kit/core";
import type { DayPlan, DayOfWeek } from "@/lib/store";

interface MealCardProps {
  meal: DayPlan["meals"][number];
  index: number;
  dayOfWeek: DayOfWeek;
  savedTime?: string;
  isDragging?: boolean;
  onClick?: () => void;
}

export default function MealCard({
  meal,
  index,
  dayOfWeek,
  savedTime,
  isDragging = false,
  onClick,
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
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`mb-2 cursor-pointer ${
        isBeingDragged ? "opacity-50 z-30" : ""
      } ${isDragging ? "rotate-2 shadow-2xl" : ""}`}
      onClick={onClick}
    >
      <div
        className="rounded-xl px-4 py-3 
                   hover:shadow-lg hover:scale-[1.02] 
                   active:scale-95 transition-transform duration-200 ease-out"
        style={{
          backgroundColor: meal.color ?? "#4F81BD",
          color: "#111",
        }}
      >
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm text-black truncate">
            {meal.mealName}
          </span>
        </div>
      </div>
    </div>
  );
}
