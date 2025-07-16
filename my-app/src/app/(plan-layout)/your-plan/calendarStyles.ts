// calendarStyles.ts
import type { CalendarConfig } from "./types";
import { DEFAULT_CALENDAR_CONFIG } from "./calendarConfig";

export class CalendarStyles {
  constructor(private config: CalendarConfig = DEFAULT_CALENDAR_CONFIG) {}

  getGridLineStyle() {
    return {
      height: `${this.config.hourHeight}px`,
      minHeight: `${this.config.hourHeight}px`,
    };
  }

  getTimeSlotStyle() {
    return {
      height: `${this.config.hourHeight}px`,
      minHeight: `${this.config.hourHeight}px`,
    };
  }

  getContainerStyle() {
    return {
      minHeight: `${this.getTotalHeight()}px`,
    };
  }

  getHeaderOffsetStyle() {
    return {
      top: `${this.config.headerHeight}px`,
    };
  }

  getDropPreviewStyle() {
    return {
      height: `${this.config.mealCardHeight}px`,
    };
  }

  getTotalHeight(): number {
    return (
      this.config.headerHeight +
      (this.config.endHour - this.config.startHour) * this.config.hourHeight
    );
  }

  getDayColumnWidth(): string {
    return this.config.dayColumnWidth.desktop;
  }

  getMobileDayColumnWidth(): string {
    return this.config.dayColumnWidth.mobile;
  }
}
