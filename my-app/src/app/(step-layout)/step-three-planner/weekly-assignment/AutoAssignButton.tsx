"use client";

import { useAppStore } from "@/lib/store";
import { DayPlan, DayOfWeek } from "@/lib/store";

const daysOfWeek: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface AutoAssignButtonProps {
  approvedDays: DayPlan[];
}

export default function AutoAssignButton({
  approvedDays,
}: AutoAssignButtonProps) {
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  const skippedDays = stepThreeData?.skippedDays || [];

  const handleAutoAssign = () => {
    if (approvedDays.length === 0) return;

    const schedule: Record<DayOfWeek, DayPlan | null> = {
      Sunday: null,
      Monday: null,
      Tuesday: null,
      Wednesday: null,
      Thursday: null,
      Friday: null,
      Saturday: null,
    };

    let index = 0;
    for (const day of daysOfWeek) {
      if (skippedDays.includes(day)) continue;
      schedule[day] = approvedDays[index % approvedDays.length];
      index++;
    }

    setStepThreeData({ weeklySchedule: schedule });
  };

  return (
    <button
      onClick={handleAutoAssign}
      className="mb-6 px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow transition"
    >
      Auto Assign Week
    </button>
  );
}
