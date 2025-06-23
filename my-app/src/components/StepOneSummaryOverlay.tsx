// components/StepOneSummaryOverlay.tsx
"use client";

import { CloseButton } from "./CloseButton";
import { Pencil } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface StepOneSummaryOverlayProps {
  onClose: () => void;
}

export function StepOneSummaryOverlay({ onClose }: StepOneSummaryOverlayProps) {
  const stepOneData = useAppStore((state) => state.stepOneData);
  if (!stepOneData) return null;

  const {
    sex,
    age,
    heightFt,
    heightIn,
    weight,
    activity,
    maintanenceCalories,
  } = stepOneData;

  return (
    <div className="fixed inset-0 z-60 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
      <div className="relative inline-flex">
        {/* Glow Border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm opacity-60 hover:opacity-100 transition-all duration-500 ease-in-out" />

        {/* Content Box */}
        <div className="relative bg-zinc-900 text-white rounded-xl p-6 w-[360px] max-w-full border border-zinc-800 shadow-xl">
          <CloseButton onClick={onClose} className="absolute top-3 right-3" />
          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
            Step 1 Summary
          </div>
          <h2 className="text-lg font-semibold mb-4">Your Data</h2>

          {/* Section 1: User Input */}
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-zinc-400">Sex:</span>
              <span className="font-medium">{sex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Height:</span>
              <span className="font-medium">
                {heightFt}′ {heightIn}″
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Weight:</span>
              <span className="font-medium">{weight} lbs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Age:</span>
              <span className="font-medium">{age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Activity Level:</span>
              <span className="font-medium">{activity.label}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Maintanence Calories:</span>
              <span className="bg-zinc-800 px-2 py-1 rounded-md text-blue-400 font-mono text-sm">
                {typeof maintanenceCalories === "number"
                  ? maintanenceCalories.toLocaleString() + " kcal"
                  : "—"}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-6">
            <a
              href="/step-one-setup"
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-md transition"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Your Data</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
