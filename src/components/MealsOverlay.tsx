"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DayOfWeek, Meal } from "@/lib/store";
import { CloseButton } from "./CloseButton";
import { MealCardList } from "../app/(step-layout)/step-three-planner/meal-brainstorm/MealResultsView/MealCardList";
import { useAppStore } from "@/lib/store";
import { getNextMealColor } from "@/utils/getNextMealColor";

interface MealsOverlayProps {
  isOpen: boolean;
  mode: "browse" | "swap";
  swapContext?: {
    mealId: string;
    dayOfWeek: DayOfWeek;
    slotIdx: number;
  };
  onClose: () => void;
}

export function MealsOverlay({
  isOpen,
  mode,
  //swapContext,
  onClose,
}: MealsOverlayProps) {
  const [activeTab, setActiveTab] = useState<
    "approved" | "saved" | "unapproved"
  >("approved");
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Get meal lists from Zustand
  const approvedMeals = useAppStore(
    (s) => s.stepThreeData?.approvedMeals ?? []
  );
  const savedMeals = useAppStore((s) => s.stepThreeData?.savedMeals ?? []);
  const generatedMeals = useAppStore(
    (s) => s.stepThreeData?.generatedMeals ?? []
  );
  const setApprovedMeals = useAppStore((s) => s.setApprovedMeals);
  const setSavedMeals = useAppStore((s) => s.setSavedMeals);
  const setGeneratedMeals = useAppStore((s) => s.setGeneratedMeals);

  // "Unapproved" = generatedMeals that are NOT in approved or saved
  const unapprovedMeals = generatedMeals.filter(
    (meal) =>
      !approvedMeals.some((a) => a.id === meal.id) &&
      !savedMeals.some((s) => s.id === meal.id)
  );

  // Handlers
  const handleApprove = (meal: Meal) => {
    if (approvedMeals.some((m) => m.id === meal.id)) return;

    const nextColor = getNextMealColor(approvedMeals);
    const coloredMeal: Meal = meal.color ? meal : { ...meal, color: nextColor };

    const updatedApproved = [...approvedMeals, coloredMeal];
    // Saved should always include any approved meal
    const updatedSaved = savedMeals.some((m) => m.id === meal.id)
      ? savedMeals
      : [...savedMeals, meal];

    // Dedupe saved
    const dedupedSaved = Array.from(
      new Map(updatedSaved.map((m) => [m.id, m])).values()
    );

    setApprovedMeals(updatedApproved);
    setSavedMeals(dedupedSaved);

    // Optional: update generatedMeals so the meal always has its color
    setGeneratedMeals(
      generatedMeals.map((m) => (m.id === coloredMeal.id ? coloredMeal : m))
    );
  };

  const handleUnapprove = (meal: Meal) => {
    setApprovedMeals(approvedMeals.filter((m) => m.id !== meal.id));
  };

  const handleSave = (meal: Meal) => {
    if (savedMeals.some((m) => m.id === meal.id)) return;
    setSavedMeals([...savedMeals, meal]);
  };

  const handleUnsave = (meal: Meal) => {
    setSavedMeals(savedMeals.filter((m) => m.id !== meal.id));
    setApprovedMeals(approvedMeals.filter((m) => m.id !== meal.id));
  };

  const handleRemove = (mealToRemove: Meal) => {
    if (!mealToRemove) return;
    const isSameMeal = (m: Meal) =>
      m.id
        ? m.id === mealToRemove.id
        : m.name.toLowerCase() === mealToRemove.name.toLowerCase();

    setGeneratedMeals(generatedMeals.filter((m) => !isSameMeal(m)));
    setApprovedMeals(approvedMeals.filter((m) => !isSameMeal(m)));
    setSavedMeals(savedMeals.filter((m) => !isSameMeal(m)));
  };

  // Pick meals for the current tab
  const meals =
    activeTab === "approved"
      ? approvedMeals
      : activeTab === "saved"
      ? savedMeals
      : unapprovedMeals;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={
              isMobile ? { y: "100%", opacity: 0 } : { scale: 0.96, opacity: 0 }
            }
            animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { y: "100%", opacity: 0 } : {}}
            transition={
              isMobile
                ? { type: "spring", stiffness: 500, damping: 38, mass: 0.4 }
                : { type: "spring", stiffness: 220, damping: 28 }
            }
            className={
              isMobile
                ? "w-full max-w-full rounded-t-2xl shadow-xl flex flex-col bg-transparent"
                : "relative inline-flex"
            }
            style={
              isMobile
                ? {}
                : {
                    width: "min(95vw, 1200px)",
                    minWidth: "320px",
                    maxWidth: "1200px",
                    height: "min(90vh, 800px)",
                    minHeight: "420px",
                    maxHeight: "800px",
                  }
            }
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow Border (Desktop Only) */}
            {!isMobile && (
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm opacity-60 hover:opacity-100 transition-all duration-500 ease-in-out pointer-events-none" />
            )}

            {/* Content Box */}
            <div
              className={
                isMobile
                  ? "relative bg-zinc-900 border border-zinc-800 rounded-t-2xl pt-1.5 px-0 pb-4 h-[90vh] w-full flex flex-col shadow-xl"
                  : "relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 w-full h-full shadow-xl flex flex-col"
              }
            >
              {/* Close Button */}
              <CloseButton
                onClick={onClose}
                className="absolute top-3 right-3"
              />

              {/* Header */}
              <div
                className={`flex justify-between items-center ${
                  isMobile ? "px-3 pt-3 pb-2" : "pt-0 pb-2"
                } border-b border-zinc-800`}
              >
                <h2 className="text-base font-bold font-mono">
                  {mode === "browse" ? "My Meals" : "Swap Meal"}
                </h2>
              </div>

              {/* Pill Selector - Smaller and tighter */}
              <div className="flex justify-center px-3 pt-2 mb-2">
                <div className="flex gap-1 bg-zinc-800 rounded-full p-2">
                  {["approved", "saved", "unapproved"].map((tab) => (
                    <button
                      key={tab}
                      className={`px-3 py-0.5 font-mono text-xs font-semibold rounded-full transition-colors
                        ${
                          activeTab === tab
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-700 text-zinc-300"
                        }
                      `}
                      style={{
                        minWidth: "80px",
                        letterSpacing: "0.01em",
                        paddingTop: "5px",
                        paddingBottom: "5px",
                      }}
                      onClick={() => setActiveTab(tab as typeof activeTab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Meals List */}
              <div
                className={`flex-1 overflow-y-auto min-h-0 pb-2 ${
                  isMobile ? "px-2" : "p-2"
                }`}
              >
                <MealCardList
                  meals={meals}
                  onApprove={handleApprove}
                  onUnapprove={handleUnapprove}
                  onSave={handleSave}
                  onUnsave={handleUnsave}
                  onRemove={handleRemove}
                />
              </div>

              {/* Footer / Get More Meals */}
              <div className="px-2 pb-3 mt-auto">
                <button
                  className="w-full bg-zinc-700 hover:bg-blue-600 text-white font-semibold py-2 rounded text-sm"
                  onClick={() => {
                    onClose();
                    // router.push("/step-three-planner/meal-brainstorm")
                  }}
                >
                  Get More Meals
                </button>
                {/* Swap mode: show Regenerate Plan button if a meal is selected */}
                {/* ... */}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
