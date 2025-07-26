"use client";

import { useAppStore } from "@/lib/store";

export default function ClearAllButton() {
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  const clearAllAssignments = () => {
    setStepThreeData({
      weeklySchedule: {
        Sunday: null,
        Monday: null,
        Tuesday: null,
        Wednesday: null,
        Thursday: null,
        Friday: null,
        Saturday: null,
      },
    });
  };

  return (
    <button
      onClick={clearAllAssignments}
      className="px-4 py-2 text-sm font-medium text-red-400 border border-red-400 rounded hover:text-white hover:border-white transition h-[38px] cursor-pointer"
    >
      Clear All
    </button>
  );
}
