"use client";

import MealCard from "./MealCard";
import { DAYS } from "./calendarConfig";
import type { DayOfWeek, DayPlan } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

interface VerticalListProps {
  weeklySchedule: Record<DayOfWeek, DayPlan | null>;
  onMealClick: (meal: DayPlan["meals"][number]) => void;
  isEditing: boolean;
}

export default function VerticalList({
  weeklySchedule,
  onMealClick,
  isEditing,
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
              className={`
    text-lg font-semibold mb-4 flex items-center justify-between
    ${isToday ? "text-blue-400" : "text-white"}
  `}
            >
              <span className="flex items-center">
                {day}
                {isToday && (
                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                    Today
                  </span>
                )}
              </span>

              {/* Summary card for cals/protein, right-aligned */}
              {dayPlan?.meals?.length ? (
                <div className="flex items-center gap-3 px-3 py-1 rounded-xl bg-zinc-800/80 shadow border border-zinc-700 text-[13px]">
                  <span className="flex items-center gap-1 text-gray-200">
                    Cal
                    <span className="bg-zinc-900/80 px-2 py-[1px] rounded font-mono text-blue-200 border border-blue-800/30">
                      {Math.round(
                        dayPlan.meals.reduce(
                          (sum, m) => sum + m.totalCalories,
                          0
                        )
                      )}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-gray-200">
                    Prot
                    <span className="bg-zinc-900/80 px-2 py-[1px] rounded font-mono text-blue-200 border border-blue-800/30">
                      {Math.round(
                        dayPlan.meals.reduce(
                          (sum, m) => sum + m.totalProtein,
                          0
                        )
                      )}
                      g
                    </span>
                  </span>
                </div>
              ) : null}
            </h3>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {dayPlan?.meals?.length ? (
                  dayPlan.meals.map((meal, index) => (
                    <motion.div
                      key={meal.mealId}
                      layout
                      initial={{ opacity: 0, scale: 0.97, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, y: 10 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <MealCard
                        meal={meal}
                        dayOfWeek={day}
                        slotIdx={index}
                        onClick={() => onMealClick(meal)}
                        variant="list"
                        isEditing={isEditing}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 italic">No meals planned</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Add meals from your meal bank or create new ones
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
