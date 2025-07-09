"use client";

import { GripVertical, Info, BookOpen } from "lucide-react";

interface DayMealRowProps {
  mealName: string;
  totalCalories: number;
  totalProtein: number;
  onShowDetails: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onShowRecipe: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function DayMealRow({
  mealName,
  totalCalories,
  totalProtein,
  onShowDetails,
  onShowRecipe,
}: DayMealRowProps) {
  return (
    <div
      className="flex items-center px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag Handle */}
      <div className="w-6 flex justify-center items-center mr-4">
        <GripVertical className="text-zinc-500 cursor-grab w-4 h-4" />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Meal Name */}
        <div className="text-white font-medium text-base mb-1">{mealName}</div>

        {/* Macro Stats */}
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xs text-zinc-400 font-medium">Calories</span>
            <span className="px-1.5 py-0 text-xs rounded-md font-mono bg-zinc-900 text-blue-400 border border-zinc-700">
              {Math.round(totalCalories)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-zinc-400 font-medium">Protein</span>
            <span className="px-1.5 py-0 text-xs rounded-md font-mono bg-zinc-900 text-blue-400 border border-zinc-700">
              {Math.round(totalProtein)}g
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 ml-4 mt-0.5">
        <button
          onClick={onShowDetails}
          className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-1 cursor-pointer"
        >
          <Info size={16} /> Details
        </button>
        <button
          onClick={onShowRecipe}
          className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-1 cursor-pointer"
        >
          <BookOpen size={16} /> Recipe
        </button>
      </div>
    </div>
  );
}
