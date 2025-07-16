// calendarConfig.ts
import type { CalendarConfig } from "./types";

export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  startHour: 6,
  endHour: 22,
  hourHeight: 40, // pixels per hour
  snapIntervalMinutes: 15,
  headerHeight: 47,
  mealCardHeight: 44,
  mealCardMargin: 12,
  timeColumnWidth: 64, // 16 * 4 (w-16 in Tailwind)
  dayColumnWidth: {
    mobile: "calc(100vw/2)",
    desktop: "220px",
  },
};
