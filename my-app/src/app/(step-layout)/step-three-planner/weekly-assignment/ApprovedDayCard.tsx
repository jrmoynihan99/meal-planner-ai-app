"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Info, GripHorizontal } from "lucide-react";

interface ApprovedDayCardProps {
  id: string;
  planNumber: number;
  meals: {
    mealId: string;
    mealName: string;
  }[];
  calories: number;
  protein: number;
  isOverlay?: boolean;
  isDragging?: boolean;
  onShowDetails?: (dayId: string) => void;
}

export default function ApprovedDayCard({
  id,
  planNumber,
  meals,
  calories,
  protein,
  isOverlay = false,
  isDragging,
  onShowDetails,
}: ApprovedDayCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = isOverlay
    ? { opacity: 0.5 }
    : {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      {...(isOverlay ? {} : attributes)} // only attributes here
      style={style}
      className="min-w-[260px] bg-zinc-800 rounded-lg p-4 text-sm shadow-md border border-zinc-700 select-none flex flex-col justify-between"
    >
      {/* Header row */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="font-bold text-white text-base">Day {planNumber}</div>

        {/* Drag handle with listeners */}
        <div className="absolute left-1/2 -translate-x-1/2" {...listeners}>
          <GripHorizontal className="w-4 h-4 text-zinc-500 opacity-70 cursor-grab" />
        </div>

        {/* Details button */}
        <button
          className="text-blue-400 hover:text-white transition text-xs flex items-center gap-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Prevent drag on click
            onShowDetails?.(id);
          }}
        >
          <Info className="w-4 h-4" />
          <span>Details</span>
        </button>
      </div>

      {/* Meal list */}
      <ol className="space-y-1 mb-4">
        {meals.map((meal, i) => (
          <li key={meal.mealId} className="flex items-start gap-1">
            <span className="w-4 shrink-0 text-zinc-500 text-xs">{i + 1}</span>
            <span className="truncate text-zinc-100 text-sm">
              {meal.mealName}
            </span>
          </li>
        ))}
      </ol>

      {/* Macro stats */}
      <div className="flex justify-center items-center gap-4 text-xs text-zinc-400 mt-auto">
        <div className="flex items-center gap-1">
          <span>Calories:</span>
          <code className="bg-zinc-900 px-2 py-0.5 rounded text-blue-400">
            {Math.round(calories)}
          </code>
        </div>
        <div className="flex items-center gap-1">
          <span>Protein:</span>
          <code className="bg-zinc-900 px-2 py-0.5 rounded text-blue-400">
            {Math.round(protein)}g
          </code>
        </div>
      </div>
    </div>
  );
}
