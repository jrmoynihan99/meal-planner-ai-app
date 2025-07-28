"use client";

import { ChevronDown, Star, StarIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { DayPlan, DayOfWeek } from "@/lib/store";
import { useAppStore } from "@/lib/store";

interface PlanDropdownProps {
  plans: {
    key: string;
    label: string;
    schedule: Record<DayOfWeek, DayPlan | null> | undefined;
  }[];
  value: string;
  onChange: (val: string) => void;
}

// Helper: checks if a schedule is complete (all days not null)
function isPlanComplete(
  schedule: Record<DayOfWeek, DayPlan | null> | undefined
) {
  return !!schedule && Object.values(schedule).every((val) => val !== null);
}

export function PlanDropdown({ plans, value, onChange }: PlanDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const favoriteKey = useAppStore(
    (s) => s.stepThreeData?.favoriteWeeklySchedule
  );
  const setFavoriteKey = useAppStore((s) => s.setFavoriteScheduleKey);

  const completePlans = plans.filter((plan) => isPlanComplete(plan.schedule));
  const selected = completePlans.find((opt) => opt.key === value);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      window.addEventListener("mousedown", handleClick);
    }
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  // If current value is not valid, fallback to first
  useEffect(() => {
    if (completePlans.length && !selected) {
      onChange(completePlans[0].key);
    }
  }, [completePlans.length, value]);

  return (
    <div className="relative w-28" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-between w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-white font-semibold text-sm transition hover:bg-zinc-700 relative z-50 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={completePlans.length === 0}
      >
        {selected?.label ?? completePlans[0]?.label ?? "No Plans"}
        <ChevronDown className="ml-2 w-4 h-4" />
      </button>

      {open && completePlans.length > 0 && (
        <div className="absolute left-0 mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg animate-fadeIn z-[9999]">
          {completePlans.map((opt) => (
            <div
              key={opt.key}
              className={`flex items-center justify-between px-3 py-2 text-sm transition first:rounded-t-lg last:rounded-b-lg ${
                value === opt.key
                  ? "bg-blue-600 text-white"
                  : "text-zinc-100 hover:bg-zinc-700"
              }`}
            >
              <button
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className="flex-1 text-left cursor-pointer"
              >
                {opt.label}
              </button>
              <button
                onClick={() =>
                  setFavoriteKey(
                    opt.key as
                      | "weeklySchedule"
                      | "weeklyScheduleTwo"
                      | "weeklyScheduleThree"
                  )
                }
                className="ml-2 text-zinc-400 hover:text-yellow-400 cursor-pointer"
                aria-label="Set as favorite plan"
              >
                {favoriteKey === opt.key ? (
                  <StarIcon className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                ) : (
                  <Star className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
