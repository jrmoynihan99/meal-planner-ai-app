"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import type { DayPlan } from "@/lib/store";
import { updateWeeklyScheduleForVariety } from "@/utils/updateWeeklySchedule";
import { defaultStepThreeData } from "@/lib/store";
import { getAllCombosForVariety } from "@/utils/updateWeeklySchedule";

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
  const [isHydrated, setIsHydrated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Selectors (safe now that hydration is handled by parent)
  const variety = useAppStore((s) => s.stepThreeData?.variety || "some");
  const shuffleIndices = useAppStore(
    (s) =>
      s.stepThreeData?.shuffleIndices || defaultStepThreeData.shuffleIndices
  );
  const setVariety = useAppStore((s) => s.setVariety);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const lockedMeals = useAppStore((s) => s.stepThreeData?.lockedMeals ?? {});

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // --- Build enabled map: a variety is available if ANY plan supports it ---
  const enabledMap: Record<VarietyOption, boolean> = VARIETY_OPTIONS.reduce(
    (acc, opt) => {
      const combos = getAllCombosForVariety(
        allPlanOneDays,
        allPlanTwoDays,
        allPlanThreeDays,
        opt.key,
        lockedMeals
      );
      acc[opt.key] = combos.length > 0;
      return acc;
    },
    {} as Record<VarietyOption, boolean>
  );

  // Update weekly schedule when variety changes
  useEffect(() => {
    if (isHydrated && enabledMap[variety]) {
      updateWeeklyScheduleForVariety(
        variety,
        allPlanOneDays,
        allPlanTwoDays,
        allPlanThreeDays,
        shuffleIndices,
        setStepThreeData,
        "set",
        lockedMeals
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    variety,
    allPlanOneDays,
    allPlanTwoDays,
    allPlanThreeDays,
    setStepThreeData,
    shuffleIndices,
    enabledMap,
    isHydrated,
  ]);

  // Dropdown click-outside handling
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  // On change: set variety, reset shuffle index for that variety, and update schedule
  const handleChange = (optKey: VarietyOption) => {
    if (!enabledMap[optKey]) return;
    setVariety(optKey);

    updateWeeklyScheduleForVariety(
      optKey,
      allPlanOneDays,
      allPlanTwoDays,
      allPlanThreeDays,
      {
        ...shuffleIndices,
        weeklySchedule: {
          ...shuffleIndices.weeklySchedule,
          [optKey]: 0,
        },
      },
      setStepThreeData,
      "set",
      lockedMeals
    );
    setOpen(false);
  };

  // --- MAIN RENDER ---
  return (
    <div className="relative w-34" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-between w-full bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-full px-3 py-1 text-white font-semibold text-sm transition hover:bg-zinc-700 relative z-50 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={!isHydrated}
      >
        <span className="text-zinc-400 text-xs mr-1">Variety:</span>
        {!isHydrated ? (
          <span className="text-zinc-500 text-xs">Loading...</span>
        ) : (
          VARIETY_OPTIONS.find((o) => o.key === variety)?.label || "Some"
        )}
        <ChevronDown className="ml-2 w-4 h-4" />
      </button>
      {open && isHydrated && (
        <div
          className="absolute left-0 mt-2 w-full bg-zinc-800 rounded-2xl shadow-2xl drop-shadow-lg animate-fadeIn p-2 flex flex-col gap-1"
          style={{
            zIndex: 9999,
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
          }}
        >
          {VARIETY_OPTIONS.map((opt) => {
            const isSelected = variety === opt.key;
            return (
              <button
                key={opt.key}
                disabled={!enabledMap[opt.key]}
                className={`
            flex items-center  cursor-pointer w-full px-3 py-1.5 rounded-xl transition text-sm
            ${
              isSelected
                ? "bg-zinc-700 text-white font-semibold"
                : !enabledMap[opt.key]
                ? "text-zinc-500 bg-zinc-900 cursor-not-allowed opacity-60"
                : "text-zinc-100 hover:bg-zinc-700 hover:text-white"
            }
          `}
                onClick={() => handleChange(opt.key)}
                tabIndex={enabledMap[opt.key] ? 0 : -1}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
