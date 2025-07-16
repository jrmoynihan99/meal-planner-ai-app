// timeUtils.ts
import type { CalendarConfig, TimeSlot } from "./types";
import { DEFAULT_CALENDAR_CONFIG } from "./calendarConfig";

export class TimeUtils {
  constructor(private config: CalendarConfig = DEFAULT_CALENDAR_CONFIG) {}

  getDefaultTime(index: number): string {
    const defaultTimes = ["08:00", "12:00", "18:00"];
    return defaultTimes[index] ?? "08:00";
  }

  parseTimeToYPosition(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = (hours - this.config.startHour) * 60 + minutes;
    return (totalMinutes / 60) * this.config.hourHeight;
  }

  parseYPositionToTime(yPosition: number): string {
    const totalMinutes = (yPosition / this.config.hourHeight) * 60;
    const snappedMinutes =
      Math.round(totalMinutes / this.config.snapIntervalMinutes) *
      this.config.snapIntervalMinutes;

    const hour = this.config.startHour + Math.floor(snappedMinutes / 60);
    const minute = snappedMinutes % 60;

    // Clamp to valid time range
    const clampedHour = Math.max(
      this.config.startHour,
      Math.min(this.config.endHour, hour)
    );
    const clampedMinute = clampedHour === this.config.endHour ? 0 : minute;

    return `${clampedHour.toString().padStart(2, "0")}:${clampedMinute
      .toString()
      .padStart(2, "0")}`;
  }

  getTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    for (
      let hour = this.config.startHour;
      hour <= this.config.endHour;
      hour++
    ) {
      slots.push({ hour, minute: 0 });
    }
    return slots;
  }

  getTotalHeight(): number {
    return (
      (this.config.endHour - this.config.startHour) * this.config.hourHeight
    );
  }

  getMealCardTopPosition(time: string): number {
    return this.parseTimeToYPosition(time) + this.config.mealCardMargin;
  }

  getDropPreviewPosition(yPosition: number): number {
    const timePosition = this.parseTimeToYPosition(
      this.parseYPositionToTime(yPosition)
    );
    return timePosition + this.config.mealCardMargin;
  }

  formatTimeLabel(hour: number): string {
    return `${hour.toString().padStart(2, "0")}:00`;
  }

  isValidTime(time: string): boolean {
    const [hours, minutes] = time.split(":").map(Number);
    return (
      hours >= this.config.startHour &&
      hours <= this.config.endHour &&
      minutes >= 0 &&
      minutes < 60
    );
  }

  // Add this method to your TimeUtils class

  parseDropPositionToTime(dropY: number): string {
    // Adjust for the meal card margin to match the preview calculation
    // This ensures the drop position matches what the user sees in the preview
    const adjustedY = dropY - this.config.mealCardMargin;
    return this.parseYPositionToTime(adjustedY);
  }

  // Add this to the bottom of the TimeUtils class
  get slotHeight(): number {
    return this.config.hourHeight;
  }

  get headerOffset(): number {
    return this.config.headerHeight;
  }
}
