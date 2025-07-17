"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import CollapsibleSection from "./CollapsibleSection";
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
import type { StepThreePlannerData } from "@/lib/store";

export default function QuestionnaireView() {
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const ingredientPrefs = stepThreeData?.ingredientPreferences;
  const setIngredientPreferences = useAppStore(
    (s) => s.setIngredientPreferences
  );
  const setMealBrainstormState = useAppStore((s) => s.setMealBrainstormState);
  const addCustomFoodItem = useAppStore((s) => s.addCustomFoodItem);

  const [openSectionIndex, setOpenSectionIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  if (!hasHydrated || !ingredientPrefs || !stepThreeData) {
    return (
      <div className="flex h-full w-full bg-black text-white justify-center items-center">
        <span className="text-gray-400 animate-pulse">
          Loading your data...
        </span>
      </div>
    );
  }

  const sections = [
    { key: "proteins", title: "Choose Proteins", options: proteinOptions },
    { key: "carbs", title: "Choose Carbs", options: carbOptions },
    { key: "veggies", title: "Choose Veggies", options: veggieOptions },
    { key: "cuisines", title: "Cuisine Preference", options: cuisineOptions },
  ] as const;

  function updateField(field: keyof typeof ingredientPrefs, values: string[]) {
    setIngredientPreferences({
      ...(ingredientPrefs as StepThreePlannerData["ingredientPreferences"]),
      [field]: values,
    });
  }

  function handleGenerate() {
    setMealBrainstormState("loading");
  }

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* ✅ True scroll container now lives here */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-6 w-full max-w-screen-xl mx-auto">
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
              customOptions={
                ingredientPrefs.customFoods?.[
                  section.key as keyof typeof ingredientPrefs.customFoods
                ] ?? []
              }
              values={ingredientPrefs[section.key]}
              onUpdate={(vals) => {
                updateField(section.key, vals);
                setOpenSectionIndex((prev) =>
                  i < sections.length - 1 ? i + 1 : prev
                );
              }}
              onAddCustom={(item) => addCustomFoodItem(section.key, item)}
              containerRef={scrollContainerRef}
              isOpen={openSectionIndex === i}
              setOpenSectionIndex={setOpenSectionIndex}
            />
          ))}

          <div className="sm:p-4">
            <FruitToggle
              value={ingredientPrefs.likesFruit}
              onChange={(val) =>
                setIngredientPreferences({
                  ...ingredientPrefs,
                  likesFruit: val,
                })
              }
            />
          </div>

          <div className="sm:mt-6 sm:p-4">
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
      </div>

      {/* Sticky footer with blurred background */}
      <div className="sticky bottom-0 z-50 bg-zinc-900/30 backdrop-blur-md border-t border-zinc-700 px-4 py-4 text-white">
        <div className="w-full max-w-screen-xl mx-auto flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
            <GlowingButtonTwo
              onClick={handleGenerate}
              text="Generate Meals"
              animatedBorder
              fullWidth
            />
          </div>
        </div>
      </div>
    </div>
  );
}
