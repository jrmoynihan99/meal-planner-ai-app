"use client";

import { useAppStore } from "@/lib/store";
import { Meal } from "@/lib/store";
import { useState } from "react";
import { Bookmark, BookmarkCheck, Trash2 } from "lucide-react";
import clsx from "clsx";
import MealDetailsModal from "./MealDetailsModal";
import { OverlayPortal } from "@/components/OverlayPortal";

interface Props {
  meal: Meal;
  onApprove: (meal: Meal) => void;
  onUnapprove: (meal: Meal) => void;
  onSave: (meal: Meal) => void;
  onUnsave: (meal: Meal) => void;
  onRemove: (meal: Meal) => void;
}

export function EditableMealCard({
  meal,
  onApprove,
  onUnapprove,
  onSave,
  onUnsave,
  onRemove,
}: Props) {
  const approvedMeals = useAppStore(
    (s) => s.stepThreeData?.approvedMeals ?? []
  );
  const savedMeals = useAppStore((s) => s.stepThreeData?.savedMeals ?? []);

  const isApproved = approvedMeals.some(
    (m) => m.name.toLowerCase() === meal.name.toLowerCase()
  );
  const isSaved = savedMeals.some(
    (m) => m.name.toLowerCase() === meal.name.toLowerCase()
  );

  const toggleApprove = () => {
    if (isApproved) onUnapprove(meal);
    else onApprove(meal);
  };

  const toggleSave = () => {
    if (isSaved) onUnsave(meal);
    else onSave(meal);
  };

  const [showDetails, setShowDetails] = useState(false);
  const [initialTab, setInitialTab] = useState<"ingredients" | "recipe">(
    "ingredients"
  );
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      onClick={toggleApprove}
      className={clsx(
        "relative border rounded-xl p-4 shadow-md transition-all cursor-pointer select-none flex flex-col justify-between overflow-hidden",
        "transform duration-200 ease-in-out",
        isApproved
          ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500 scale-[0.98]"
          : "border-zinc-700 bg-zinc-800/80 scale-100"
      )}
    >
      {/* Shine background layers */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#d7d2cc] to-[#304352] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none" />
      {/* Foreground content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Save + Remove Icons */}
        <div className="absolute top-0 right-0 flex gap-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave();
            }}
            className="text-zinc-400 hover:text-yellow-400 p-1 cursor-pointer"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-yellow-400" />
            ) : (
              <Bookmark className="w-5 h-5 text-zinc-400 hover:text-yellow-400 transition" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(meal);
            }}
            className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Title + Description */}
        <div>
          <h3
            className="
              text-lg font-semibold font-mono text-white pr-14 break-words
              line-clamp-1 sm:line-clamp-2
              min-h-[1.75rem] sm:min-h-[2.75rem]
            "
            title={meal.name}
          >
            {meal.name}
          </h3>
          <p className="text-gray-400 font-mono text-xs mt-1 line-clamp-2 min-h-[2.25rem]">
            {meal.description}
          </p>
          {meal.bestFor && (
            <p className="text-[11px] text-zinc-400 mt-2 font-mono tracking-wide uppercase">
              Best For: <span className="text-blue-400">{meal.bestFor}</span>
            </p>
          )}
        </div>

        {/* Image + Side Info + Toggle */}
        <div className="relative flex items-stretch justify-between mt-3">
          <div className="relative w-44">
            {meal.imageUrl ? (
              <img
                src={meal.imageUrl}
                alt={meal.name}
                loading="eager"
                onLoad={() => setImageLoaded(true)}
                className={clsx(
                  "rounded-lg w-full aspect-square object-cover transition-opacity duration-300",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
              />
            ) : (
              <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-zinc-700">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 animate-shimmer" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between items-end ml-4 flex-1">
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInitialTab("recipe");
                  setShowDetails(true);
                }}
                className="px-4 py-2 text-sm md:text-xs font-mono border border-blue-500 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition"
              >
                Recipe
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInitialTab("ingredients");
                  setShowDetails(true);
                }}
                className="px-4 py-2 text-sm md:text-xs font-mono border border-blue-500 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition"
              >
                Ingredients
              </button>
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <span
                className={`text-sm font-mono font-medium ${
                  isApproved ? "text-blue-400" : "text-zinc-400"
                }`}
              >
                {isApproved ? "Approved" : "Not Approved"}
              </span>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleApprove();
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  isApproved ? "bg-blue-600" : "bg-zinc-600"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    isApproved ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <OverlayPortal>
          <MealDetailsModal
            meal={meal}
            onClose={() => setShowDetails(false)}
            initialTab={initialTab}
          />
        </OverlayPortal>
      )}
    </div>
  );
}
