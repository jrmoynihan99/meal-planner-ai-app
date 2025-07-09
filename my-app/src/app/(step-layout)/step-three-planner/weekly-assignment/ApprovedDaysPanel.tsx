// ApprovedDaysPanel.tsx
"use client";

import ApprovedDayCard from "./ApprovedDayCard";
import { useAppStore } from "@/lib/store";

interface ApprovedDaysPanelProps {
  approvedDays: {
    id: string;
    title: string;
    calories: number;
    protein: number;
  }[];
}

export default function ApprovedDaysPanel({
  approvedDays,
}: ApprovedDaysPanelProps) {
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const skippedDays = stepThreeData?.skippedDays || [];

  return (
    <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-700 px-4 py-3 overflow-x-auto z-40">
      <div className="flex gap-4">
        {approvedDays.map((day) => (
          <ApprovedDayCard
            key={day.id}
            id={day.id}
            title={day.title || day.id}
            calories={day.calories}
            protein={day.protein}
          />
        ))}
      </div>
    </div>
  );
}
