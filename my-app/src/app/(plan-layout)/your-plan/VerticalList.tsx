"use client";

import MealCard from "./MealCard";
import { DAYS } from "./calendarConfig";
import type { DayOfWeek, DayPlan } from "@/lib/store";

interface VerticalListProps {
  weeklySchedule: Record<DayOfWeek, DayPlan | null>;
  onMealClick: (meal: DayPlan["meals"][number]) => void;
}

export default function VerticalList({
  weeklySchedule,
  onMealClick,
}: VerticalListProps) {
  return (
    <div className="space-y-6 p-4 h-full overflow-y-auto">
      {DAYS.map((day) => {
        const dayPlan = weeklySchedule[day];
        const isToday =
          day === new Date().toLocaleDateString("en-US", { weekday: "long" });

        return (
          <div
            key={day}
            className="bg-zinc-900 rounded-lg p-4 border border-zinc-800"
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                isToday ? "text-blue-400" : "text-white"
              }`}
            >
              {day}
              {isToday && (
                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                  Today
                </span>
              )}
            </h3>

            <div className="space-y-3">
              {dayPlan?.meals?.length ? (
                dayPlan.meals.map((meal) => (
                  <MealCard
                    key={`${day}-${meal.mealId}`}
                    meal={meal}
                    dayOfWeek={day}
                    onClick={() => onMealClick(meal)}
                    variant="list"
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 italic">No meals planned</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Add meals from your meal bank or create new ones
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
