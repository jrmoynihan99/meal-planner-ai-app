"use client";

import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { MealCardList } from "./MealCardList";
import type { Meal } from "@/lib/store";

export default function MealResultsView() {
  const generatedMeals = useAppStore(
    (s) => s.stepThreeData?.generatedMeals || []
  );
  const approvedMeals = useAppStore(
    (s) => s.stepThreeData?.approvedMeals || []
  );
  const setMealBrainstormState = useAppStore((s) => s.setMealBrainstormState);
  const ingredientPreferences = useAppStore(
    (s) => s.stepThreeData?.ingredientPreferences
  );
  const stepTwoData = useAppStore((s) => s.stepTwoData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  const [refinementPrompt, setRefinementPrompt] = useState("");

  async function handleRefine() {
    if (!refinementPrompt.trim()) return;
    setMealBrainstormState("loading");

    const res = await fetch("/api/generate-meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        preferences: ingredientPreferences,
        calories: stepTwoData?.goalCalories,
        protein: stepTwoData?.goalProtein,
        prompt: refinementPrompt,
      }),
    });

    const data = await res.json();
    const newMeals = data.meals;

    // Keep any previously approved meals if their names match
    const reapproved = newMeals.filter((meal: Meal) =>
      approvedMeals.some(
        (a) => a.name.toLowerCase() === meal.name.toLowerCase()
      )
    );

    setStepThreeData({
      generatedMeals: newMeals,
      approvedMeals: reapproved,
    });

    setRefinementPrompt("");
    setMealBrainstormState("completed");
  }

  function handleEditPreferences() {
    setMealBrainstormState("editing");
  }

  function handleRegenerate() {
    setMealBrainstormState("loading");
  }

  return (
    <div className="p-4 max-w-3xl mx-auto flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-center">Your Meals</h1>

      <MealCardList
        meals={generatedMeals}
        onApprove={(meal) => {
          const updated = [...approvedMeals, meal];
          setStepThreeData({ approvedMeals: updated });
        }}
        onUnapprove={(meal) => {
          const updated = approvedMeals.filter((m) => m.id !== meal.id);
          setStepThreeData({ approvedMeals: updated });
        }}
        onRemove={(index) => {
          const updated = [...generatedMeals];
          const removed = updated.splice(index, 1)[0];

          // Also remove from approvedMeals if it was approved
          const remainingApproved = approvedMeals.filter(
            (m) => m.id !== removed.id
          );

          setStepThreeData({
            generatedMeals: updated,
            approvedMeals: remainingApproved,
          });
        }}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          value={refinementPrompt}
          onChange={(e) => setRefinementPrompt(e.target.value)}
          placeholder="Want something different? Try: 'Make it more plant-based'"
          className="flex-1 border px-4 py-2 rounded"
        />
        <button
          onClick={handleRefine}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded"
        >
          Regenerate with Prompt
        </button>
      </div>

      <div className="flex justify-between mt-6 gap-4">
        <button
          onClick={handleEditPreferences}
          className="w-full border border-white text-white py-2 rounded"
        >
          Edit Preferences
        </button>
        <button
          onClick={handleRegenerate}
          className="w-full bg-blue-700 text-white py-2 rounded"
        >
          Regenerate Meals
        </button>
      </div>
    </div>
  );
}
