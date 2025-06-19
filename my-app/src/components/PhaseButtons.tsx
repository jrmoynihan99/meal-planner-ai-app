"use client";

import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { InfoOverlay } from "./InfoOverlay";
import { Info } from "lucide-react";
import { SendIconButton } from "./SendIconButton";
import type { MouseEvent } from "react";

interface PhaseButtonsProps {
  onSelect: (text: string, immediate?: boolean) => void;
}

const suggestionsByPhase: Record<string, string[]> = {
  ingredients: [
    "Animal Based",
    "Vegetarian",
    "Low-carb",
    "Text 1",
    "Low-Testingnnn2",
  ],
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
  "Animal Based": "Simple... Meat, dairy, fruit, and honey",
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
};

const prompts: Record<string, string> = {
  "Animal Based":
    "Beef, chicken, pork, eggs, raw honey, fruit, milk, fruit juice",
  Vegetarian: "Exclude all meat and fish from meals.",
  "Low-carb": "Create meals without rice, bread, or pasta.",
  "Add variety": "Diversify ingredients used across all meals.",
  "Remove high-fat meals": "Filter out any meals that are high in fats.",
  "Swap carbs": "Replace high-GI carbs with low-GI alternatives.",
  "Add more veggies":
    "Ensure every meal includes at least 2 servings of vegetables.",
};

export function PhaseButtons({ onSelect }: PhaseButtonsProps) {
  const currentPhase = useAppStore((state) => state.currentPhase);
  const [buttons, setButtons] = useState<string[]>([]);
  const [infoVisible, setInfoVisible] = useState(false);
  const [activeDescription, setActiveDescription] = useState<string | null>(
    null
  );
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [animatingButtons, setAnimatingButtons] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    setButtons(suggestionsByPhase[currentPhase] || []);
  }, [currentPhase]);

  const handleInfoClick = (text: string) => {
    setActiveTitle(text);
    setActiveDescription(descriptions[text]);
    setActivePrompt(prompts[text]);
    setInfoVisible(true);
  };

  const handleArrowClick = (text: string, e: MouseEvent<Element>) => {
    e.stopPropagation();
    setAnimatingButtons((prev) => new Set(prev).add(text));
    setTimeout(() => onSelect(text, true), 200);
    setTimeout(() => {
      setAnimatingButtons((prev) => {
        const newSet = new Set(prev);
        newSet.delete(text);
        return newSet;
      });
    }, 800);
  };

  if (!buttons.length) return null;

  return (
    <>
      <div className="flex gap-3 mb-4 overflow-x-auto whitespace-nowrap sm:flex-wrap sm:justify-center sm:overflow-visible hide-scrollbar -mx-4 px-4">
        {buttons.map((text) => (
          <div
            key={text}
            className="relative inline-flex group focus-within:outline-none"
          >
            <div className="absolute inset-0 bg-zinc-700 rounded-xl" />
            <div className="relative flex items-center justify-between gap-2 px-4 py-4 text-sm font-medium font-sans text-zinc-200 transition-colors duration-200 bg-zinc-800 hover:bg-zinc-700 rounded-xl focus:outline-none cursor-pointer whitespace-nowrap shrink-0">
              <span
                onClick={() => onSelect(text, false)}
                className="cursor-pointer"
              >
                {text}
              </span>
              <div className="flex items-center gap-1">
                <Info
                  size={16}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInfoClick(text);
                  }}
                  className="text-zinc-400 hover:text-white transition"
                  aria-hidden="true"
                />
                <div
                  className="relative h-4 w-4"
                  onClick={(e) => handleArrowClick(text, e)}
                >
                  <SendIconButton
                    isAnimating={animatingButtons.has(text)}
                    onClick={(e) => handleArrowClick(text, e)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {infoVisible && activeTitle && activeDescription && (
        <InfoOverlay
          title={activeTitle}
          description={activeDescription}
          prompt={activePrompt || ""}
          onClose={() => setInfoVisible(false)}
          showHelp={true}
        />
      )}
    </>
  );
}
