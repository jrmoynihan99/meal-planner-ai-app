"use client";

import WeekdaySlot from "./WeekdaySlot";
import type { DayOfWeek, DayPlan } from "@/lib/store";

interface VerticalListProps {
  weeklySchedule: Record<DayOfWeek, DayPlan | null>;
  onMealClick: (meal: DayPlan["meals"][number]) => void;
}

const days: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function VerticalList({
  weeklySchedule,
  onMealClick,
}: VerticalListProps) {
  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">
      {days.map((day) => (
        <div key={day} className="w-full border-b border-zinc-800">
          <WeekdaySlot
            dayOfWeek={day}
            assignedDay={weeklySchedule[day]}
            onMealClick={onMealClick}
            showHeader={true}
            fullWidth
          />
        </div>
      ))}
    </div>
  );
}
