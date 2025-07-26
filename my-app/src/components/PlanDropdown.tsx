import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { DayPlan, DayOfWeek } from "@/lib/store";

interface PlanDropdownProps {
  // Pass the plans directly with their data
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

  // Only show fully-complete plans
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

  // If the current value is not among available options, fallback to the first
  useEffect(() => {
    if (completePlans.length && !selected) {
      onChange(completePlans[0].key);
    }
    // Only run when completePlans change or value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completePlans.length, value]);

  return (
    <div className="relative w-24" ref={ref}>
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
        <div
          className="absolute left-0 mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg animate-fadeIn"
          style={{
            zIndex: 9999,
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
          }}
        >
          {completePlans.map((opt) => (
            <button
              key={opt.key}
              className={`w-full text-left px-3 py-2 text-sm transition first:rounded-t-lg last:rounded-b-lg cursor-pointer
                ${
                  value === opt.key
                    ? "bg-blue-600 text-white"
                    : "text-zinc-100 hover:bg-zinc-700"
                }`}
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
