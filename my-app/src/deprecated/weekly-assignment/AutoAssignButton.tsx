"use client";

import { useAppStore } from "@/lib/store";
import { DayPlan, DayOfWeek } from "@/lib/store";
import { createBaseSchedule } from "./WeeklyGrid";

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

    const currentSchedule: Record<DayOfWeek, DayPlan | null> = {
      ...createBaseSchedule(),
      ...stepThreeData?.weeklySchedule,
    };

    let index = 0;

    for (const day of daysOfWeek) {
      const isSkipped = skippedDays.includes(day);
      const isAlreadyAssigned = currentSchedule[day] !== null;

      if (isSkipped || isAlreadyAssigned) continue;

      currentSchedule[day] = approvedDays[index % approvedDays.length];
      index++;
    }

    setStepThreeData({ weeklySchedule: currentSchedule });
  };

  return (
    <button
      onClick={handleAutoAssign}
      className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow transition cursor-pointer"
    >
      Auto Assign Week
    </button>
  );
}
