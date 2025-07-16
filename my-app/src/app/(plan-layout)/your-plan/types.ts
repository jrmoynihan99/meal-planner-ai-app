// types.ts
export interface TimeSlot {
  hour: number;
  minute: number;
}

export interface CalendarConfig {
  startHour: number;
  endHour: number;
  hourHeight: number;
  snapIntervalMinutes: number;
  headerHeight: number;
  mealCardHeight: number;
  mealCardMargin: number;
  timeColumnWidth: number;
  dayColumnWidth: {
    mobile: string;
    desktop: string;
  };
}
