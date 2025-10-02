"use client";

import WeekdaySlot from "./WeekdaySlot";
import { useAppStore, DayOfWeek, DayPlan } from "@/lib/store";
import { useDndMonitor } from "@dnd-kit/core";

const daysOfWeek: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const createBaseSchedule = (): Record<DayOfWeek, DayPlan | null> => ({
  Sunday: null,
  Monday: null,
  Tuesday: null,
  Wednesday: null,
  Thursday: null,
  Friday: null,
  Saturday: null,
});

interface WeeklyGridProps {
  approvedDays: DayPlan[];
  onShowDetails: (dayId: string) => void; // ✅ New prop
}

export default function WeeklyGrid({
  approvedDays,
  onShowDetails,
}: WeeklyGridProps) {
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  const weeklySchedule = stepThreeData?.weeklySchedule || createBaseSchedule();
  const skippedDays = stepThreeData?.skippedDays || [];

  useDndMonitor({
    onDragEnd(event) {
      const { over, active } = event;
      if (over && active) {
        const dayOfWeek = over.id as DayOfWeek;
        const approvedDayId = active.id as string;
        const fullDay = approvedDays.find((d) => d.id === approvedDayId);
        if (!fullDay) return;

        const updatedSchedule = {
          ...createBaseSchedule(),
          ...weeklySchedule,
          [dayOfWeek]: fullDay,
        };

        setStepThreeData({ weeklySchedule: updatedSchedule });
      }
    },
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
      {daysOfWeek.map((day) => {
        const fullPlan = weeklySchedule[day];
        const isSkipped = skippedDays.includes(day);
        const isCheatDay = fullPlan?.isCheatDay === true;

        const assignedDay =
          fullPlan && !isCheatDay
            ? {
                id: fullPlan.id,
                planNumber: fullPlan.planNumber,
                title: fullPlan.meals.map((m) => m.mealId).join(", "),
                calories: fullPlan.dayCalories,
                protein: fullPlan.dayProtein,
              }
            : null;

        return (
          <WeekdaySlot
            key={day}
            dayOfWeek={day}
            assignedDay={assignedDay}
            isSkipped={isSkipped}
            toggleSkipped={() => {
              const updated = isSkipped
                ? skippedDays.filter((d) => d !== day)
                : [...skippedDays, day];
              setStepThreeData({ skippedDays: updated });
            }}
            isCheatDay={isCheatDay}
            toggleCheatDay={() => {
              const updated = { ...weeklySchedule };
              updated[day] = isCheatDay
                ? null
                : {
                    id: `cheat-${day}`,
                    planNumber: -1,
                    meals: [],
                    dayCalories: 0,
                    dayProtein: 0,
                    isCheatDay: true,
                  };
              setStepThreeData({ weeklySchedule: updated });
            }}
            onDrop={(approvedDayId) => {
              const fullDay = approvedDays.find((d) => d.id === approvedDayId);
              if (!fullDay) return;

              const updated = {
                ...weeklySchedule,
                [day]: fullDay,
              };

              setStepThreeData({ weeklySchedule: updated });
            }}
            onClear={() => {
              const updated = {
                ...weeklySchedule,
                [day]: null,
              };

              setStepThreeData({ weeklySchedule: updated });
            }}
            onShowDetails={onShowDetails} // ✅ Pass it down
          />
        );
      })}
    </div>
  );
}
