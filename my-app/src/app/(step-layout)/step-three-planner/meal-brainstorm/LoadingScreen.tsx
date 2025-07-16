"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import type { Meal } from "@/lib/store";

const loadingTexts = [
  "Cooking up your meals...",
  "Measuring macros...",
  "Chopping veggies...",
  "Preheating GPT...",
  "Plating your plan...",
];

export default function LoadingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const setMealBrainstormState = useAppStore((s) => s.setMealBrainstormState);
  const ingredientPreferences = useAppStore(
    (s) => s.stepThreeData?.ingredientPreferences
  );
  const previousApprovedMeals = useAppStore(
    (s) => s.stepThreeData?.approvedMeals || []
  );
  const stepTwoData = useAppStore((s) => s.stepTwoData);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function generateMeals() {
      try {
        const res = await fetch("/api/generate-meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            preferences: ingredientPreferences,
            calories: stepTwoData?.goalCalories,
            protein: stepTwoData?.goalProtein,
          }),
        });

        const data = await res.json();
        const newMeals = data.meals;

        // Automatically re-approve any meals that match prior approvals by name
        const reapproved = newMeals.filter((meal: Meal) =>
          previousApprovedMeals.some(
            (a) => a.name.toLowerCase() === meal.name.toLowerCase()
          )
        );

        setStepThreeData({
          generatedMeals: newMeals,
          approvedMeals: reapproved,
        });

        setMealBrainstormState("completed");
      } catch (err) {
        console.error("Meal generation failed:", err);
        setMealBrainstormState("not_started");
      }
    }

    generateMeals();
  }, [ingredientPreferences, stepTwoData]);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <Image
        src="/onion-bounce-background.gif"
        alt="Generating meals..."
        width={400}
        height={400}
        className="mb-6"
      />
      <div className="w-[300px] h-2 mt-8 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 animate-loadingBar"
          style={{ width: "100%" }}
        />
      </div>
      <div className="mt-6 h-6 w-full text-white text-sm sm:text-base relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {loadingTexts[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
