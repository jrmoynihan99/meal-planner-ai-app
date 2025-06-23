"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { GoalPaceBadge } from "@/components/GoalPaceBadge";

interface GoalTileProps {
  title: string;
  description: string;
  calorieDelta: string;
  isSelected: boolean;
  onSelect: () => void;
  weight: number;
  maintanenceCalories: number;
  calorieTarget: number;
  proteinTarget: number;
}

export function GoalTile({
  title,
  description,
  calorieDelta,
  isSelected,
  onSelect,
  weight,
  maintanenceCalories,
}: GoalTileProps) {
  const delta = parseInt(calorieDelta);
  const calories = maintanenceCalories + delta;
  const protein =
    delta < 0 ? Math.round(weight * 1.0) : Math.round(weight * 0.8);

  const pace =
    title.includes("Fast") && title.includes("Loss")
      ? "-2lb/week"
      : title.includes("Moderate") && title.includes("Loss")
      ? "-1lb/week"
      : title.includes("Fast") && title.includes("Gain")
      ? "+2lb/week"
      : title.includes("Moderate") && title.includes("Gain")
      ? "+1lb/week"
      : "--";

  const colorClass =
    title.includes("Fast") && (title.includes("Loss") || title.includes("Gain"))
      ? "text-red-400"
      : title.includes("Moderate")
      ? "text-amber-400"
      : "text-zinc-400";

  return (
    <div
      onClick={onSelect}
      className={clsx(
        "relative rounded-2xl p-6 border shadow-md transition-all flex flex-col justify-between min-h-[260px] cursor-pointer",
        isSelected
          ? "border-2 border-blue-500 bg-zinc-700 shadow-blue-500/20"
          : "border border-zinc-700 bg-zinc-800 hover:border-zinc-500 hover:shadow-lg"
      )}
    >
      {/* Title with pace */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <GoalPaceBadge title={title} />
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-400">{description}</p>

      {/* Calorie + Protein targets */}
      <div className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Daily Calorie Target:</span>
          <span className="bg-zinc-800 px-2 py-1 rounded-md text-blue-400 font-mono text-sm border border-zinc-700">
            {calories.toLocaleString()} kcal
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Daily Protein Target:</span>
          <span className="bg-zinc-800 px-2 py-1 rounded-md text-blue-400 font-mono text-sm border border-zinc-700">
            {protein}g
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-blue-400 bg-transparent rounded-md cursor-pointer group"
        >
          <span className="relative inline-block leading-tight">
            Learn More
            <span className="absolute left-0 -bottom-[2px] h-[1px] w-0 bg-blue-400 transition-all duration-300 group-hover:w-full" />
          </span>
        </button>

        {isSelected ? (
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center px-3 py-1 text-sm text-white bg-blue-600 rounded-md cursor-default shadow-md shadow-blue-400/40 max-sm:text-base max-sm:px-4 max-sm:py-2"
          >
            <CheckCircleIcon className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="px-3 py-1 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md cursor-pointer max-sm:text-base max-sm:px-4 max-sm:py-2"
          >
            Choose Goal
          </button>
        )}
      </div>
    </div>
  );
}
