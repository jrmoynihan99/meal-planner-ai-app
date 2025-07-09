"use client";

import WeekdaySlot from "./WeekdaySlot";
import { useAppStore, DayOfWeek, DayPlan } from "@/lib/store";
import { useDndMonitor } from "@dnd-kit/core";

const daysOfWeek: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const createBaseSchedule = (): Record<DayOfWeek, DayPlan | null> => ({
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
}

export default function WeeklyGrid({ approvedDays }: WeeklyGridProps) {
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

        const updatedSchedule: Record<DayOfWeek, DayPlan | null> = {
          ...createBaseSchedule(),
          ...weeklySchedule,
          [dayOfWeek]: fullDay,
        };

        setStepThreeData({ weeklySchedule: updatedSchedule });
      }
    },
  });

  return (
    <div className="flex gap-4 pb-4 overflow-x-auto">
      {daysOfWeek.map((day) => {
        const fullPlan = weeklySchedule[day];
        const isSkipped = skippedDays.includes(day);

        const assignedDay = fullPlan
          ? {
              id: fullPlan.id,
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
            onDrop={(approvedDayId) => {
              const fullDay = approvedDays.find((d) => d.id === approvedDayId);
              if (!fullDay) return;

              const updatedSchedule: Record<DayOfWeek, DayPlan | null> = {
                ...createBaseSchedule(),
                ...weeklySchedule,
                [day]: fullDay,
              };

              setStepThreeData({ weeklySchedule: updatedSchedule });
            }}
            onClear={() => {
              const updatedSchedule: Record<DayOfWeek, DayPlan | null> = {
                ...createBaseSchedule(),
                ...weeklySchedule,
                [day]: null,
              };

              setStepThreeData({ weeklySchedule: updatedSchedule });
            }}
          />
        );
      })}
    </div>
  );
}
