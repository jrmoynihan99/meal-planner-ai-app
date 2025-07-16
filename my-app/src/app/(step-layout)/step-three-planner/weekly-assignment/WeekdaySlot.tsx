"use client";

import { useDroppable } from "@dnd-kit/core";
import { Info } from "lucide-react";

interface WeekdaySlotProps {
  dayOfWeek: string;
  assignedDay: {
    id: string;
    planNumber: number;
    title: string;
    calories: number;
    protein: number;
  } | null;
  isSkipped: boolean;
  toggleSkipped: () => void;
  isCheatDay: boolean;
  toggleCheatDay: () => void;
  onDrop: (approvedDayId: string) => void;
  onClear: () => void;
  onShowDetails: (dayId: string) => void; // ✅ New prop
}

export default function WeekdaySlot({
  dayOfWeek,
  assignedDay,
  isSkipped,
  toggleSkipped,
  isCheatDay,
  toggleCheatDay,
  onDrop,
  onClear,
  onShowDetails, // ✅ Receive it
}: WeekdaySlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dayOfWeek });

  const baseStyle =
    "min-w-[160px] h-40 rounded-xl p-3 text-sm border flex flex-col justify-center items-center transition duration-200 select-none";

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

  const ringClass = isOver
    ? "ring-2 ring-blue-500"
    : isCheatDay
    ? "ring-2 ring-yellow-400"
    : "";

  const borderClass = assignedDay
    ? "border-blue-500"
    : isCheatDay
    ? "border-yellow-400"
    : "border-zinc-700";

  return (
    <div
      ref={setNodeRef}
      className={`${baseStyle} bg-zinc-900 ${borderClass} ${ringClass}`}
    >
      <div className="font-semibold mb-2">{dayOfWeek}</div>

      {assignedDay ? (
        <>
          <div className="w-[140px] bg-zinc-800 rounded-md px-3 py-2 text-xs text-white border border-zinc-700 flex items-center justify-between">
            <div className="font-semibold">Day {assignedDay.planNumber}</div>
            <button
              onClick={() => onShowDetails(assignedDay.id)} // ✅ Call here
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-blue-500 text-blue-400 hover:text-white hover:bg-blue-500 transition text-xs cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>
          </div>
          <button
            onClick={onClear}
            className="mt-2 text-xs text-blue-400 hover:underline cursor-pointer"
          >
            Clear
          </button>
        </>
      ) : isCheatDay ? (
        <>
          <div className="text-yellow-400 text-xs text-center font-medium">
            Cheat Day
          </div>
          <button
            onClick={toggleCheatDay}
            className="mt-2 text-xs text-yellow-400 hover:underline"
          >
            Clear
          </button>
        </>
      ) : (
        <div className="text-zinc-500 text-xs text-center">
          Drop a day here
          <button
            onClick={toggleCheatDay}
            className="block mt-1 text-[11px] underline text-yellow-400 hover:text-white cursor-pointer"
          >
            or mark as Cheat Day
          </button>
        </div>
      )}
    </div>
  );
}
