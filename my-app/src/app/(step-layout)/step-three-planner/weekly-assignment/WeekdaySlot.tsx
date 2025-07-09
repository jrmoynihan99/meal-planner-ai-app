"use client";

import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface WeekdaySlotProps {
  dayOfWeek: string;
  assignedDay: {
    id: string;
    title: string;
    calories: number;
    protein: number;
  } | null;
  onDrop: (approvedDayId: string) => void;
  onClear: () => void;
  isSkipped: boolean;
  toggleSkipped: () => void;
}

export default function WeekdaySlot({
  dayOfWeek,
  assignedDay,
  onDrop,
  onClear,
  isSkipped,
  toggleSkipped,
}: WeekdaySlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dayOfWeek });

  const baseStyle =
    "min-w-[160px] h-28 rounded-xl p-3 text-sm border flex flex-col justify-center items-center transition duration-200 select-none";

  if (isSkipped) {
    return (
      <div
        className={`${baseStyle} bg-zinc-800 border-zinc-700 text-zinc-500 cursor-pointer opacity-50 hover:opacity-70`}
        onClick={toggleSkipped}
      >
        <div className="font-semibold mb-1">{dayOfWeek}</div>
        <div className="text-xs">Skipped — Click to enable</div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`${baseStyle} bg-zinc-900 border-zinc-700 text-white ${
        isOver ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="font-semibold mb-2">{dayOfWeek}</div>

      {assignedDay ? (
        <div className="text-center">
          <div className="text-white font-medium mb-1 truncate">
            {assignedDay.title}
          </div>
          <div className="text-zinc-400 text-xs">
            {assignedDay.calories} kcal • {assignedDay.protein}g protein
          </div>
          <button
            onClick={onClear}
            className="mt-1 text-xs text-blue-400 hover:underline"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="text-zinc-500 text-xs text-center">Drop a day here</div>
      )}
    </div>
  );
}
