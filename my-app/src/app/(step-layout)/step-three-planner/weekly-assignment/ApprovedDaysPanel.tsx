"use client";

import ApprovedDayCard from "./ApprovedDayCard";
import { useAppStore, DayPlan } from "@/lib/store";

interface ApprovedDaysPanelProps {
  approvedDays: DayPlan[];
  onShowDetails: (dayId: string) => void; // ✅ Add this prop
}

export default function ApprovedDaysPanel({
  approvedDays,
  onShowDetails, // ✅ Destructure it
}: ApprovedDaysPanelProps) {
  return (
    <div className="sticky bottom-0 w-full bg-zinc-900 border-t border-zinc-700 px-4 py-3 overflow-x-auto z-40">
      <div className="flex gap-4">
        {approvedDays.map((day) => (
          <ApprovedDayCard
            key={day.id}
            id={day.id}
            planNumber={day.planNumber}
            meals={day.meals}
            calories={day.dayCalories}
            protein={day.dayProtein}
            onShowDetails={onShowDetails} // ✅ Pass it down
          />
        ))}
      </div>
    </div>
  );
}
