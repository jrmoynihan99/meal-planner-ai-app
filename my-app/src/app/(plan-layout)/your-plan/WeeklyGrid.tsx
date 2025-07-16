"use client";

import WeekdaySlot from "./WeekdaySlot";
import { TimeUtils } from "./timeUtils";
import { CalendarStyles } from "./calendarStyles";
import type { DayOfWeek, DayPlan } from "@/lib/store";

interface WeeklyGridProps {
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

export default function WeeklyGrid({
  weeklySchedule,
  onMealClick,
}: WeeklyGridProps) {
  const timeUtils = new TimeUtils();
  const styles = new CalendarStyles();
  const timeSlots = timeUtils.getTimeSlots();

  return (
    <div className="flex h-full w-full">
      <div className="relative flex-1 overflow-x-auto">
        <div
          className="relative flex min-w-[900px]"
          style={styles.getContainerStyle()}
        >
          <div className="w-16 shrink-0 flex flex-col text-xs text-gray-400 font-mono pt-10 pl-4 pr-1 sticky left-0 bg-black z-20 border-r border-zinc-800">
            {timeSlots.map(({ hour }) => (
              <div
                key={hour}
                className="flex items-start justify-start"
                style={styles.getTimeSlotStyle()}
              >
                {timeUtils.formatTimeLabel(hour)}
              </div>
            ))}
          </div>

          <div className="relative flex-1">
            <div
              className="absolute left-0 w-full z-0"
              style={styles.getHeaderOffsetStyle()}
            >
              {timeSlots.map((_, index) => (
                <div
                  key={index}
                  className="border-t border-zinc-800"
                  style={styles.getGridLineStyle()}
                />
              ))}
            </div>

            <div className="relative flex z-10">
              {days.map((day) => (
                <WeekdaySlot
                  key={day}
                  dayOfWeek={day}
                  assignedDay={weeklySchedule[day]}
                  onMealClick={onMealClick}
                  showHeader={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
