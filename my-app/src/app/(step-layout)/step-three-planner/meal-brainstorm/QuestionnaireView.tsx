"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import CollapsibleSection from "./CollapsibleSection";
import { ArrowRight } from "lucide-react";
import {
  proteinOptions,
  carbOptions,
  veggieOptions,
  cuisineOptions,
} from "./questionOptions";
import FruitToggle from "./FruitToggle";
import CustomInput from "./CustomInput";
import MealsPerDaySelector from "./MealsPerDaySelector";
import { GlowingButtonTwo } from "@/components/GlowingButtonTwo";
import type { StepThreePlannerData, Meal } from "@/lib/store";
import QuestionnaireViewInfoOverlay from "@/components/QuestionnaireViewInfoOverlay";
import { generateMeals } from "./mealGeneration";

type ValidSectionKey = "proteins" | "carbs" | "veggies" | "cuisines";

export default function QuestionnaireView() {
  const stepKey = "step-three-questionnaire";

  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const ingredientPrefs = stepThreeData?.ingredientPreferences;
  const setIngredientPreferences = useAppStore(
    (s) => s.setIngredientPreferences
  );
  const setMealBrainstormState = useAppStore((s) => s.setMealBrainstormState);
  const addCustomFoodItem = useAppStore((s) => s.addCustomFoodItem);

  const hiddenOverlays = useAppStore((s) => s.hiddenOverlays);
  const setOverlayHidden = useAppStore((s) => s.setOverlayHidden);

  const [showOverlay, setShowOverlay] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [openSectionIndex, setOpenSectionIndex] = useState(0);

  useEffect(() => {
    if (hasHydrated && !hiddenOverlays?.[stepKey]) {
      const timeout = setTimeout(() => {
        setShowOverlay(true);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [hasHydrated, hiddenOverlays]);

  const sections: {
    key: ValidSectionKey;
    title: string;
    options: string[];
  }[] = [
    { key: "proteins", title: "Choose Proteins", options: proteinOptions },
    { key: "carbs", title: "Choose Carbs", options: carbOptions },
    { key: "veggies", title: "Choose Veggies", options: veggieOptions },
    { key: "cuisines", title: "Cuisine Preference", options: cuisineOptions },
  ];

  function updateField(field: ValidSectionKey, values: string[]) {
    setIngredientPreferences({
      ...(ingredientPrefs as StepThreePlannerData["ingredientPreferences"]),
      [field]: values,
    });
  }

  function handleGenerate() {
    if (!stepThreeData) return;
    generateMeals({
      stepThreeData,
      setStepThreeData,
      setMealBrainstormState,
    });
  }

  if (!hasHydrated || !ingredientPrefs || !stepThreeData) {
    return (
      <div className="flex h-full w-full bg-black text-white justify-center items-center">
        <span className="text-gray-400 animate-pulse">
          Loading your data...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-white relative">
      {showOverlay && (
        <QuestionnaireViewInfoOverlay onClose={() => setShowOverlay(false)} />
      )}

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-32 w-full max-w-screen-xl mx-auto">
          <MealsPerDaySelector
            value={stepThreeData.mealsPerDay}
            onChange={(val) => setStepThreeData({ mealsPerDay: val })}
          />

          {sections.map((section, i) => (
            <CollapsibleSection
              key={section.key}
              index={i}
              total={sections.length}
              title={section.title}
              field={section.key}
              options={section.options}
              customOptions={ingredientPrefs.customFoods?.[section.key] ?? []}
              values={ingredientPrefs[section.key] as string[]}
              onUpdate={(vals) => updateField(section.key, vals)}
              onAddCustom={(item) => addCustomFoodItem(section.key, item)}
              containerRef={scrollContainerRef}
              isOpen={openSectionIndex === i}
              setOpenSectionIndex={setOpenSectionIndex}
            />
          ))}

          <FruitToggle
            value={ingredientPrefs.likesFruit}
            onChange={(val) =>
              setIngredientPreferences({
                ...ingredientPrefs,
                likesFruit: val,
              })
            }
          />

          <CustomInput
            value={ingredientPrefs.customInput}
            onChange={(val) =>
              setIngredientPreferences({
                ...ingredientPrefs,
                customInput: val,
              })
            }
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none px-4 pb-8 pt-4 sm:pb-8">
        <div className="w-full max-w-screen-xl mx-auto flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex flex-row gap-2 w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
            <GlowingButtonTwo
              onClick={handleGenerate}
              text={
                stepThreeData.mealBrainstormState === "editing"
                  ? "Generate More"
                  : "Generate Meals"
              }
              animatedBorder
              fullWidth
              className="bg-zinc-800/90 backdrop-blur-md border-zinc-700/70 shadow-xl"
            />

            {stepThreeData.mealBrainstormState === "editing" && (
              <button
                onClick={() => setMealBrainstormState("completed")}
                className="relative inline-flex items-center justify-center px-6 py-3 text-white font-semibold text-sm uppercase tracking-wide rounded-full bg-blue-600/90 hover:bg-blue-500/90 backdrop-blur-md border border-blue-600/70 transition duration-200 cursor-pointer w-full shadow-xl"
              >
                View Meals
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
