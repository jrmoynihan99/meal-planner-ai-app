"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { MealCardList } from "./MealCardList";
import MealEditFooter from "./MealEditFooter";
import clsx from "clsx";
import { Meal } from "@/lib/store";
import { FilePen, Plus } from "lucide-react";
import MealResultsInfoOverlay from "@/components/MealResultsInfoOverlay";
import { GlowingButtonTwo } from "@/components/GlowingButtonTwo";
import { generateMeals } from "../QuestionnaireView/mealGeneration";
import GenerateMoreMealsOverlay from "./GenerateMoreMealsOverlay";
import { getNextMealColor } from "@/utils/getNextMealColor";

const FILTERS = ["all", "approved", "unapproved", "saved"] as const;
type FilterType = (typeof FILTERS)[number];

export default function MealResultsView() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setApprovedMeals = useAppStore((s) => s.setApprovedMeals);
  const setSavedMeals = useAppStore((s) => s.setSavedMeals);
  const setGeneratedMeals = useAppStore((s) => s.setGeneratedMeals);
  const setMealBrainstormState = useAppStore((s) => s.setMealBrainstormState);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const [isMobile, setIsMobile] = useState(false);

  const [showOverlay, setShowOverlay] = useState(false);
  const [showGenerateOverlay, setShowGenerateOverlay] = useState(false);

  const allMeals = stepThreeData?.generatedMeals ?? [];
  const approvedMeals = stepThreeData?.approvedMeals ?? [];
  const savedMeals = stepThreeData?.savedMeals ?? [];

  const isMealApproved = (meal: Meal) =>
    approvedMeals.some((m) => m.id === meal.id);

  const isMealSaved = (meal: Meal) => savedMeals.some((m) => m.id === meal.id);

  const handleApprove = (meal: Meal) => {
    // If already approved, keep its color
    if (approvedMeals.some((m) => m.id === meal.id)) return;

    const nextColor = getNextMealColor(approvedMeals);

    // If meal already has a color (maybe from generatedMeals), keep it
    const coloredMeal: Meal = meal.color ? meal : { ...meal, color: nextColor };

    const updatedApproved = [...approvedMeals, coloredMeal];
    const updatedSaved = isMealSaved(meal) ? savedMeals : [...savedMeals, meal];

    const dedupedSaved = Array.from(
      new Map(updatedSaved.map((m) => [m.id, m])).values()
    );

    setApprovedMeals(updatedApproved);
    setSavedMeals(dedupedSaved);

    // Optional: Update generatedMeals so the meal always has its color
    setGeneratedMeals(
      allMeals.map((m) => (m.id === coloredMeal.id ? coloredMeal : m))
    );
  };

  const handleUnapprove = (meal: Meal) => {
    setApprovedMeals(approvedMeals.filter((m) => m.id !== meal.id));
  };

  const handleSave = (meal: Meal) => {
    setSavedMeals([...savedMeals, meal]);
  };

  const handleUnsave = (meal: Meal) => {
    // Remove from saved and approved if present
    setSavedMeals(savedMeals.filter((m) => m.id !== meal.id));
    setApprovedMeals(approvedMeals.filter((m) => m.id !== meal.id));
  };

  const handleRemove = (mealToRemove: Meal) => {
    if (!mealToRemove) return;

    const isSameMeal = (m: Meal) =>
      m.id
        ? m.id === mealToRemove.id
        : m.name.toLowerCase() === mealToRemove.name.toLowerCase();

    const updatedGenerated = allMeals.filter((m) => !isSameMeal(m));
    const updatedApproved = approvedMeals.filter((m) => !isSameMeal(m));
    const updatedSaved = savedMeals.filter((m) => !isSameMeal(m));

    setGeneratedMeals(updatedGenerated);
    setApprovedMeals(updatedApproved);
    setSavedMeals(updatedSaved);
  };

  const hiddenOverlays = useAppStore((s) => s.hiddenOverlays);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!hiddenOverlays["step-three-results"]) {
      const timeout = setTimeout(() => {
        setShowOverlay(true);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [hiddenOverlays]);

  const handleGenerateMore = () => {
    if (!stepThreeData) return;
    generateMeals({
      stepThreeData,
      setStepThreeData,
      setMealBrainstormState,
    });
  };

  const filteredMeals =
    selectedFilter === "approved"
      ? allMeals.filter(isMealApproved)
      : selectedFilter === "unapproved"
      ? allMeals.filter((m) => !isMealApproved(m))
      : selectedFilter === "saved"
      ? savedMeals
      : allMeals;

  const getCount = (type: FilterType) => {
    switch (type) {
      case "approved":
        return approvedMeals.length;
      case "unapproved":
        return allMeals.filter((m) => !isMealApproved(m)).length;
      case "saved":
        return savedMeals.length;
      case "all":
      default:
        return allMeals.length;
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {showOverlay && (
        <MealResultsInfoOverlay onClose={() => setShowOverlay(false)} />
      )}
      {/* Filters + Buttons */}
      <div className="flex items-center justify-between gap-0 sm:gap-1 px-4 pt-0 sm:pt-2 pb-2 border-b border-zinc-700 bg-black">
        {/* Left: Fixed buttons */}
        <div
          className={clsx(
            "flex flex-row flex-shrink-0 mr-2",
            isMobile ? "gap-0" : "gap-2"
          )}
        >
          <button
            onClick={() => setMealBrainstormState("editing")}
            className={clsx(
              "transition cursor-pointer flex items-center justify-center",
              isMobile
                ? "p-2 text-blue-500 hover:text-blue-400"
                : "px-3 py-2 gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl"
            )}
          >
            <FilePen className="w-5 h-5" />
            {!isMobile && <span>Edit Preferences</span>}
          </button>

          {isMobile ? (
            <button
              onClick={() => setShowGenerateOverlay(true)}
              className="p-2 transition cursor-pointer flex items-center justify-center"
            >
              <Plus className="w-6 h-6 animate-multicolor-glow" />
            </button>
          ) : (
            <GlowingButtonTwo
              onClick={() => setShowGenerateOverlay(true)}
              text="Generate More Meals"
              animatedBorder
              className="bg-zinc-800/90 backdrop-blur-md border-zinc-700/70 shadow-xl h-8 px-6 text-sm font-semibold"
            />
          )}
        </div>

        {/* Right: Scrollable filter pills */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-1 whitespace-nowrap">
            {FILTERS.map((type) => (
              <button
                key={type}
                onClick={(e) => {
                  setSelectedFilter(type);
                  e.currentTarget.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest",
                  });
                }}
                className={clsx(
                  "px-3 py-1 text-xs rounded-full border font-mono tracking-wide transition cursor-pointer flex items-center gap-2",
                  selectedFilter === type
                    ? type === "saved"
                      ? "border-yellow-400 text-yellow-300 bg-zinc-800"
                      : "border-blue-500 text-blue-400 bg-zinc-800"
                    : "border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400"
                )}
              >
                <span>{type[0].toUpperCase() + type.slice(1)}</span>
                <span
                  className={clsx(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    selectedFilter === type
                      ? type === "saved"
                        ? "bg-yellow-400 text-black"
                        : "bg-blue-500 text-white"
                      : "bg-zinc-600 text-white"
                  )}
                >
                  {getCount(type)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meal Cards with bottom padding for floating footer */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-32"
        ref={scrollContainerRef}
      >
        <MealCardList
          meals={filteredMeals}
          onApprove={handleApprove}
          onUnapprove={handleUnapprove}
          onSave={handleSave} // ←
          onUnsave={handleUnsave} // ←
          onRemove={handleRemove}
        />
      </div>

      {/* Floating Footer */}
      <MealEditFooter />
      {showGenerateOverlay && (
        <GenerateMoreMealsOverlay
          onClose={() => setShowGenerateOverlay(false)}
          onGenerate={handleGenerateMore}
        />
      )}
    </div>
  );
}
