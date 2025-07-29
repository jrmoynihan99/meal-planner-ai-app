// calendarConfig.ts
export const CALENDAR_CONFIG = {
  startHour: 5,
  endHour: 22,
  hourHeight: 35,
  snapInterval: 15, // minutes
  headerHeight: 69,
  mobileHeaderHeight: 69,
  mealCardHeight: 70, // Match your current card height
  timeColumnWidth: 64,
} as const;

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

// Utility functions
export const timeUtils = {
  getTimeSlots: () => {
    const slots = [];
    for (
      let hour = CALENDAR_CONFIG.startHour;
      hour <= CALENDAR_CONFIG.endHour;
      hour++
    ) {
      slots.push({
        hour,
        label: timeUtils.formatTime(hour),
      });
    }
    return slots;
  },

  formatTime: (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  },

  getYPosition: (timeString: string) => {
    // Convert "HH:MM" to pixel position
    if (!timeString) return 0;

    const [hours, minutes] = timeString.split(":").map(Number);
    const hourOffset = hours - CALENDAR_CONFIG.startHour;
    const minuteOffset = (minutes / 60) * CALENDAR_CONFIG.hourHeight;
    return hourOffset * CALENDAR_CONFIG.hourHeight + minuteOffset;
  },

  getCurrentDay: () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
    }) as (typeof DAYS)[number];
  },

  getDefaultTime: (index: number) => {
    // Default meal times: breakfast 7:00, lunch 12:00, dinner 18:00
    const defaultTimes = ["07:00", "12:00", "18:00"];
    return defaultTimes[index] || "12:00";
  },
};
