"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import TypewriterReveal from "@/components/TypewriterReveal";
import { AnimatePresence } from "framer-motion";
import { GlowingButton } from "@/components/GlowingButton";
import {
  mealSelectionPrompt,
  ingredientMacroPrompt,
} from "@/lib/prompts/dayCreation";

export default function DayGenerationPage() {
  const dayGenerationState = useAppStore(
    (s) => s.stepThreeData?.dayGenerationState ?? "not_started"
  );
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  const [showStartUI, setShowStartUI] = useState(false);

  const handleStart = async () => {
    setStepThreeData({ dayGenerationState: "started" });

    const { stepThreeData, stepTwoData } = useAppStore.getState();
    const { mealsPerDay, approvedMeals } = stepThreeData ?? {};
    const { goalCalories, goalProtein } = stepTwoData ?? {};

    if (!mealsPerDay || !approvedMeals || approvedMeals.length === 0) {
      console.error("❌ Missing mealsPerDay or approvedMeals.");
      return;
    }

    try {
      // --- STEP 1: Meal Selection ---
      const systemPrompt = mealSelectionPrompt({ mealsPerDay, approvedMeals });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, messages: [] }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (!reader) throw new Error("No reader on meal selection response");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      console.log("🧠 Raw GPT Meal Selection Response:\n", fullText);

      const selectedMealNames = JSON.parse(fullText.trim());
      const selectedMeals = approvedMeals.filter((meal) =>
        selectedMealNames.includes(meal.name)
      );

      console.log("✅ Selected Meals:", selectedMeals);

      if (selectedMeals.length !== mealsPerDay) {
        console.warn("⚠️ GPT returned fewer meals than expected.");
      }

      // --- STEP 2: Ingredient Macro Lookup ---
      const ingredientPrompt = ingredientMacroPrompt(selectedMeals);

      const ingredientRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt: ingredientPrompt, messages: [] }),
      });

      const ingredientReader = ingredientRes.body?.getReader();
      let ingredientText = "";

      if (!ingredientReader)
        throw new Error("No reader on ingredient response");

      while (true) {
        const { done, value } = await ingredientReader.read();
        if (done) break;
        ingredientText += decoder.decode(value, { stream: true });
      }

      console.log("🧠 Raw GPT Ingredient Macro Response:\n", ingredientText);

      const match = ingredientText.match(
        /\[START_JSON\]([\s\S]*?)\[END_JSON\]/
      );
      if (!match)
        throw new Error("No [START_JSON] block found in macro response");

      const ingredientData = JSON.parse(match[1]);
      console.log("✅ Parsed Ingredient Macros:", ingredientData);

      // --- STEP 3: Optimizer API ---
      const optimizerMeals = selectedMeals.map((meal) => ({
        name: meal.name,
        ingredients: meal.ingredients.map((ing) => ({
          name: ing.name,
          grams: ingredientData[ing.name]?.default_grams ?? 0,
        })),
      }));

      const optimizerRes = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meals: optimizerMeals,
          ingredientMacros: ingredientData,
          targetCalories: goalCalories ?? 0,
          targetProtein: goalProtein ?? 0,
        }),
      });

      if (!optimizerRes.ok) {
        const err = await optimizerRes.json();
        throw new Error(err.error || "Unknown optimizer error");
      }

      const { result } = await optimizerRes.json();
      console.log("✅ Final Optimized Day:", result);
    } catch (err) {
      console.error("❌ Error during meal generation pipeline:", err);
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setStepThreeData({
        days: [],
        dayGenerationState: "not_started",
      });
    }
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 sm:p-6 max-w-3xl mx-auto font-sans">
      {/* NOT STARTED */}
      {dayGenerationState === "not_started" && (
        <>
          <div className="flex flex-col items-center justify-center text-center h-[160px] sm:h-[180px]">
            <TypewriterReveal
              lines={[
                "Now that you’ve approved your meals...",
                "It’s time to build your actual days of eating.",
                "Click below to let our AI work it's magic",
              ]}
              typingSpeed={20}
              delayBetween={400}
              className="text-xl sm:text-2xl font-mono"
              onComplete={() => setShowStartUI(true)}
            />
          </div>

          {showStartUI && (
            <div className="w-full flex justify-center mt-6">
              <AnimatePresence>
                <GlowingButton onClick={handleStart} text="GET STARTED" />
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* STARTED */}
      {dayGenerationState === "started" && (
        <div className="mt-10 text-center text-zinc-400">
          Generating your first day of eating...
        </div>
      )}

      {/* COMPLETED */}
      {dayGenerationState === "completed" && (
        <div className="mt-10 text-center text-zinc-400">
          Your days have been generated!
        </div>
      )}
    </main>
  );
}
