// components/VarietyDropdown.tsx
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { buildWeeklySchedulesWithVariety } from "@/utils/buildWeeklySchedulesWithVariety";
import type { DayPlan } from "@/lib/store";

const VARIETY_OPTIONS = [
  { key: "none", label: "None" },
  { key: "less", label: "Less" },
  { key: "some", label: "Some" },
  { key: "lots", label: "Lots" },
] as const;

type VarietyOption = (typeof VARIETY_OPTIONS)[number]["key"];

interface VarietyDropdownProps {
  allPlanOneDays: DayPlan[];
  allPlanTwoDays: DayPlan[];
  allPlanThreeDays: DayPlan[];
}

export function VarietyDropdown({
  allPlanOneDays,
  allPlanTwoDays,
  allPlanThreeDays,
}: VarietyDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const variety = useAppStore((s) => s.stepThreeData?.variety || "some");
  const selectedScheduleKey = useAppStore(
    (s) => s.stepThreeData?.selectedScheduleKey || "weeklySchedule"
  );
  const setVariety = useAppStore((s) => s.setVariety);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  // Decide which are enabled based on the currently selected schedule
  let enabledMap: Record<VarietyOption, boolean> = {
    none: false,
    less: false,
    some: false,
    lots: false,
  };

  // Get the correct day plan array based on selectedScheduleKey
  let currentDayPlans: DayPlan[];
  switch (selectedScheduleKey) {
    case "weeklySchedule":
      currentDayPlans = allPlanOneDays;
      break;
    case "weeklyScheduleTwo":
      currentDayPlans = allPlanTwoDays;
      break;
    case "weeklyScheduleThree":
      currentDayPlans = allPlanThreeDays;
      break;
    default:
      currentDayPlans = allPlanOneDays;
  }

  const numDays = currentDayPlans.length;

  if (numDays >= 7) {
    enabledMap = { none: true, less: true, some: true, lots: true };
  } else if (numDays >= 4) {
    enabledMap = { none: true, less: true, some: true, lots: false };
  } else if (numDays >= 2) {
    enabledMap = { none: true, less: true, some: false, lots: false };
  } else if (numDays === 1) {
    enabledMap = { none: true, less: false, some: false, lots: false };
  }

  // Auto-adjust variety if current selection is not enabled for this plan
  useEffect(() => {
    if (!enabledMap[variety]) {
      // Find the highest enabled variety option and set it
      const fallbackVariety = enabledMap.lots
        ? "lots"
        : enabledMap.some
        ? "some"
        : enabledMap.less
        ? "less"
        : "none";

      setVariety(fallbackVariety);

      console.log(
        `Auto-adjusted variety from "${variety}" to "${fallbackVariety}" because current selection is not supported by plan with ${numDays} days`
      );
    }
  }, [selectedScheduleKey, numDays, variety, enabledMap, setVariety]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleChange = (optKey: VarietyOption) => {
    if (!enabledMap[optKey]) return;
    setVariety(optKey);

    // For simplicity, always update all three plans (or you can filter based on available)
    const planIndices: number[] = [1, 2, 3];
    const { weeklySchedule, weeklyScheduleTwo, weeklyScheduleThree } =
      buildWeeklySchedulesWithVariety(planIndices, optKey, {
        allPlanOneDays,
        allPlanTwoDays,
        allPlanThreeDays,
      });

    setStepThreeData({
      weeklySchedule,
      weeklyScheduleTwo,
      weeklyScheduleThree,
    });

    setOpen(false);
  };

  return (
    <div className="relative w-34" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-between w-full bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-full px-3 py-1 text-white font-semibold text-sm transition hover:bg-zinc-700 relative z-50 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-zinc-400 text-xs mr-1">Variety:</span>
        {VARIETY_OPTIONS.find((o) => o.key === variety)?.label || "Some"}
        <ChevronDown className="ml-2 w-4 h-4" />
      </button>
      {open && (
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
          {VARIETY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              disabled={!enabledMap[opt.key]}
              className={`w-full text-left px-3 py-2 text-sm transition first:rounded-t-lg last:rounded-b-lg
                ${
                  variety === opt.key
                    ? "bg-blue-600 text-white cursor-pointer"
                    : !enabledMap[opt.key]
                    ? "text-zinc-500 bg-zinc-900 cursor-not-allowed opacity-50"
                    : "text-zinc-100 hover:bg-zinc-700 cursor-pointer"
                }`}
              onClick={() => handleChange(opt.key)}
              tabIndex={enabledMap[opt.key] ? 0 : -1}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
