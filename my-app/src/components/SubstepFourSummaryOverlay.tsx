"use client";

import { useState } from "react";
import { CloseButton } from "./CloseButton";
import { useAppStore, DayOfWeek, DayPlan } from "@/lib/store";
import { ChevronDown, ChevronUp, Utensils } from "lucide-react";
import Link from "next/link";

interface SubstepFourSummaryOverlayProps {
  onClose: () => void;
}

const daysOfWeek: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function SubstepFourSummaryOverlay({
  onClose,
}: SubstepFourSummaryOverlayProps) {
  const weeklySchedule: Record<DayOfWeek, DayPlan | null> = useAppStore(
    (s) => s.stepThreeData?.weeklySchedule
  ) || {
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null,
  };

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );

  const toggleDropdown = (dayId: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dayId]: !prev[dayId],
    }));
  };

  const orderedDays = daysOfWeek.filter((day) => weeklySchedule[day] !== null);

  return (
    <div className="fixed inset-0 z-60 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
      <div className="relative inline-flex">
        {/* Glow Border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm opacity-60 hover:opacity-100 transition-all duration-500 ease-in-out" />

        {/* Content Box */}
        <div className="relative bg-zinc-900 text-white rounded-xl p-6 w-[400px] max-w-full border border-zinc-800 shadow-xl">
          <CloseButton onClick={onClose} className="absolute top-3 right-3" />

          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
            SUBSTEP 4 SUMMARY
          </div>
          <h2 className="text-lg font-semibold mb-4">Your Weekly Plan</h2>

          {/* Weekly Schedule List */}
          <div className="space-y-3 text-sm mb-6 max-h-[300px] overflow-y-auto pr-1">
            {orderedDays.length > 0 ? (
              orderedDays.map((dayOfWeek) => {
                const entry = weeklySchedule[dayOfWeek];
                if (!entry) return null;

                const isCheatDay = entry.isCheatDay === true;
                const isOpen = openDropdowns[dayOfWeek];

                return (
                  <div
                    key={dayOfWeek}
                    className="border-b border-zinc-800 pb-2 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-semibold cursor-pointer">
                        {dayOfWeek}
                      </span>

                      {isCheatDay ? (
                        <span className="text-xs text-yellow-400 font-semibold">
                          Cheat Day
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleDropdown(dayOfWeek)}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-white transition cursor-pointer"
                        >
                          <span>Day {entry.planNumber}</span>
                          {isOpen ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {!isCheatDay && isOpen && (
                      <div className="ml-2 mt-1 space-y-1 text-zinc-300 text-xs font-mono">
                        <ul className="space-y-1">
                          {entry.meals.map((meal, i) => (
                            <li key={meal.mealId} className="truncate">
                              {i + 1}. {meal.mealName}
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-4 pt-2">
                          <div className="flex items-center gap-1">
                            <span>Calories:</span>
                            <code className="bg-zinc-800 px-2 py-0.5 rounded text-blue-400">
                              {Math.round(entry.dayCalories)}
                            </code>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Protein:</span>
                            <code className="bg-zinc-800 px-2 py-0.5 rounded text-blue-400">
                              {Math.round(entry.dayProtein)}g
                            </code>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-zinc-500 font-mono">No days assigned yet.</p>
            )}
          </div>

          {/* Edit Button */}
          <div className="mt-4">
            <Link
              href="/step-three-planner/weekly-assignment"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-md transition"
            >
              <Utensils className="w-4 h-4" />
              <span>Edit Weekly Plan</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
