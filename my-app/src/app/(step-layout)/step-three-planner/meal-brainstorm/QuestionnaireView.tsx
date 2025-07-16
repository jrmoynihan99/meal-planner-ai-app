"use client";

import { useState } from "react";
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

interface QuestionnaireViewProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function QuestionnaireView({
  containerRef,
}: QuestionnaireViewProps) {
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setIngredientPreferences = useAppStore(
    (s) => s.setIngredientPreferences
  );
  const setMealBrainstormState = useAppStore((s) => s.setMealBrainstormState);

  const [openSectionIndex, setOpenSectionIndex] = useState(0);

  const [localPrefs, setLocalPrefs] = useState(
    stepThreeData?.ingredientPreferences || {
      proteins: [],
      carbs: [],
      veggies: [],
      likesFruit: true,
      cuisines: [],
      customInput: "",
    }
  );

  const sections = [
    {
      key: "proteins",
      title: "Choose Proteins",
      options: proteinOptions,
    },
    {
      key: "carbs",
      title: "Choose Carbs",
      options: carbOptions,
    },
    {
      key: "veggies",
      title: "Choose Veggies",
      options: veggieOptions,
    },
    {
      key: "cuisines",
      title: "Cuisine Preference",
      options: cuisineOptions,
    },
  ] as const;

  function updateField(field: keyof typeof localPrefs, values: string[]) {
    setLocalPrefs((prev) => ({
      ...prev,
      [field]: values,
    }));
  }

  function handleGenerate() {
    setIngredientPreferences(localPrefs);
    setMealBrainstormState("loading");
  }

  return (
    <div className="min-h-screen px-4 pt-4 pb-20 w-full max-w-screen-xl mx-auto">
      {sections.map((section, i) => (
        <CollapsibleSection
          key={section.key}
          index={i}
          total={sections.length}
          title={section.title}
          field={section.key}
          options={section.options}
          values={localPrefs[section.key]}
          onUpdate={updateField}
          containerRef={containerRef}
          isOpen={openSectionIndex === i}
          setOpenSectionIndex={setOpenSectionIndex}
        />
      ))}

      <div className="sm:mt-12 sm:mb-12">
        <FruitToggle
          value={localPrefs.likesFruit}
          onChange={(val) =>
            setLocalPrefs((prev) => ({
              ...prev,
              likesFruit: val,
            }))
          }
        />
      </div>

      {/* Final Step: Custom input */}
      <CustomInput
        value={localPrefs.customInput}
        onChange={(val) =>
          setLocalPrefs((prev) => ({ ...prev, customInput: val }))
        }
      />

      <button
        onClick={handleGenerate}
        className="mt-10 w-full bg-blue-600 text-white font-semibold py-3 rounded text-lg"
      >
        Generate Meals
      </button>
    </div>
  );
}
