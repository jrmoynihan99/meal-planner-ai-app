"use client";

import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { InfoOverlay } from "./InfoOverlay";
import { Info } from "lucide-react";

interface PhaseButtonsProps {
  onSelect: (text: string) => void;
}

const suggestionsByPhase: Record<string, string[]> = {
  ingredients: ["Meat-heavy", "Vegetarian", "Low-carb"],
  meal_approval: [
    "Add variety",
    "Remove high-fat meals",
    "Swap carbs",
    "Add more veggies",
  ],
  macro_targets: [
    "1500 cal / 100g protein",
    "1800 cal / 120g protein",
    "2000 cal / 150g protein",
  ],
  day_generation: [
    "Generate 3 days",
    "Add high-protein breakfast",
    "Remove dairy meals",
  ],
  week_structure: [
    "All 7 days",
    "Weekdays only",
    "No Sundays",
    "Add cheat day",
  ],
  final_output: [],
};

const descriptions: Record<string, string> = {
  "Meat-heavy": "Focus on meals that prioritize red meat, chicken, and fish.",
  Vegetarian: "Only plant-based ingredients, no meat or fish.",
  "Low-carb":
    "Meals that avoid breads, pasta, rice, or other starch-heavy foods.",
  "Add variety":
    "Increase diversity in meals by swapping ingredients or rotating.",
  "Remove high-fat meals":
    "Filter out meals that rely heavily on oils, fattier cuts, or cheese.",
  "Swap carbs":
    "Exchange high-GI carbs (like white rice) for slower-digesting ones.",
  "Add more veggies":
    "Ensure each meal includes a meaningful amount of vegetables.",
  // Add more if needed...
};

export function PhaseButtons({ onSelect }: PhaseButtonsProps) {
  const currentPhase = useAppStore((state) => state.currentPhase);
  const [buttons, setButtons] = useState<string[]>([]);
  const [infoVisible, setInfoVisible] = useState(false);
  const [activeDescription, setActiveDescription] = useState<string | null>(
    null
  );
  const [activeTitle, setActiveTitle] = useState<string | null>(null);

  useEffect(() => {
    setButtons(suggestionsByPhase[currentPhase] || []);
  }, [currentPhase]);

  const handleInfoClick = (text: string) => {
    setActiveTitle(text);
    setActiveDescription(descriptions[text]);
    setInfoVisible(true);
  };

  if (!buttons.length) return null;

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4 justify-center">
        {buttons.map((text) => (
          <div
            key={text}
            className="relative inline-flex group cursor-pointer focus-within:outline-none"
            onClick={() => onSelect(text)}
          >
            <div className="absolute transition-all duration-500 ease-in-out opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm" />
            <button
              type="button"
              className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-zinc-900 rounded-xl focus:outline-none cursor-pointer"
            >
              {text}
              <Info
                size={16}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInfoClick(text);
                }}
                className="ml-2 text-zinc-400 hover:text-white transition"
                aria-hidden="true"
              />
            </button>
          </div>
        ))}
      </div>

      {infoVisible && activeTitle && activeDescription && (
        <InfoOverlay
          title={activeTitle}
          description={activeDescription}
          onClose={() => setInfoVisible(false)}
        />
      )}
    </>
  );
}
