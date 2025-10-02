"use client";

import { useState, useRef } from "react";
import { SendIconButton } from "@/components/SendIconButton";
import { Meal, useAppStore } from "@/lib/store";
import FloatingPlanProgressButton from "@/components/FloatingPlanProgressButton";

export default function MealEditFooter() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const setMealBrainstormState = useAppStore((s) => s.setMealBrainstormState);

  const generatedMeals = stepThreeData?.generatedMeals || [];
  const approvedMeals = stepThreeData?.approvedMeals || [];
  const savedMeals = stepThreeData?.savedMeals || [];

  const handleFormSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setMealBrainstormState("loading");

    try {
      const res = await fetch("/api/meal-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatedMeals,
          userRequest: input,
        }),
      });

      const rawMeal: Meal = await res.json();
      if (!rawMeal || !rawMeal.id) {
        throw new Error("Invalid meal returned from GPT");
      }

      // Validate `bestFor`
      const allowedBestFor = ["breakfast", "lunch", "dinner", "versatile"];
      const updatedMeal: Meal = {
        ...rawMeal,
        bestFor: allowedBestFor.includes(rawMeal.bestFor ?? "")
          ? rawMeal.bestFor
          : "versatile",
      };

      const replaceMeal = (list: Meal[]) =>
        list.map((m) => (m.id === updatedMeal.id ? updatedMeal : m));

      const updatedGeneratedMeals = replaceMeal(generatedMeals);
      const updatedApprovedMeals = approvedMeals.some(
        (m) => m.id === updatedMeal.id
      )
        ? replaceMeal(approvedMeals)
        : approvedMeals;

      const updatedSavedMeals = savedMeals.some((m) => m.id === updatedMeal.id)
        ? replaceMeal(savedMeals)
        : savedMeals;

      setStepThreeData({
        generatedMeals: updatedGeneratedMeals,
        approvedMeals: updatedApprovedMeals,
        savedMeals: updatedSavedMeals,
      });

      setInput("");
      setMealBrainstormState("completed");
    } catch (err) {
      console.error("❌ GPT edit request failed:", err);
      setMealBrainstormState("completed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none px-4 pb-8 pt-4 sm:pb-8">
      <form onSubmit={handleFormSubmit} className="pointer-events-auto">
        <div className="flex items-end justify-between gap-2 w-full max-w-[95%] sm:w-[66%] mx-auto">
          {/* Glowing AI input bar */}
          <div className="relative flex group flex-1 transition-all duration-300">
            <div className="absolute glow-static" />
            <div className="absolute glow-focus group-focus-within:opacity-100" />
            <div className="relative flex flex-col items-stretch justify-start bg-zinc-800/90 backdrop-blur-md border border-zinc-700/70 rounded-4xl px-4 pt-0 shadow-xl w-full min-h-[3.25rem]">
              <textarea
                ref={textareaRef}
                id="meal-edit-input"
                className="w-full text-base font-mono text-white bg-transparent focus:outline-none px-2 pr-10 placeholder-gray-400 resize-none overflow-hidden break-words whitespace-pre-wrap h-[3rem] leading-[3rem]"
                placeholder="e.g. Remove parsley from the shrimp quinoa meal..."
                value={input}
                name="message"
                rows={1}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit();
                  }
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={isLoading || !input.trim()}
              >
                <SendIconButton
                  isAnimating={false}
                  colorClass="text-white hover:text-zinc-300"
                  onClick={() => {}}
                />
              </button>
            </div>
          </div>

          {/* Inline Progress Button on Mobile */}
          <div className="flex-shrink-0 flex items-end pb-0">
            <FloatingPlanProgressButton />
          </div>
        </div>
      </form>
    </footer>
  );
}
