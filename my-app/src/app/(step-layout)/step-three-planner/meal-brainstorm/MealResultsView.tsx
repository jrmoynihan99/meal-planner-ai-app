"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { MealCardList } from "./MealCardList";
import { InputFooter } from "../InputFooter";
import clsx from "clsx";

const FILTERS = ["all", "approved", "unapproved", "saved"] as const;
type FilterType = (typeof FILTERS)[number];

export default function MealResultsView() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const inputRef = useRef("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setApprovedMeals = useAppStore((s) => s.setApprovedMeals);
  const setSavedMeals = useAppStore((s) => s.setSavedMeals);
  const setGeneratedMeals = useAppStore((s) => s.setGeneratedMeals);

  const allMeals = stepThreeData.generatedMeals ?? [];
  const approvedMeals = stepThreeData.approvedMeals ?? [];
  const savedMeals = stepThreeData.savedMeals ?? [];

  const isMealApproved = (meal: any) =>
    approvedMeals.some((m) => m.id === meal.id);

  const isMealSaved = (meal: any) => savedMeals.some((m) => m.id === meal.id);

  const handleApprove = (meal: any) => {
    const updatedApproved = [...approvedMeals, meal];
    const updatedSaved = isMealSaved(meal) ? savedMeals : [...savedMeals, meal];

    const dedupedSaved = Array.from(
      new Map(updatedSaved.map((m) => [m.id, m])).values()
    );

    setApprovedMeals(updatedApproved);
    setSavedMeals(dedupedSaved);
  };

  const handleUnapprove = (meal: any) => {
    setApprovedMeals(approvedMeals.filter((m) => m.id !== meal.id));
  };

  const handleRemove = (index: number) => {
    // Optional: implement meal removal from generatedMeals if needed
  };

  const filteredMeals =
    selectedFilter === "approved"
      ? allMeals.filter(isMealApproved)
      : selectedFilter === "unapproved"
      ? allMeals.filter((m) => !isMealApproved(m))
      : selectedFilter === "saved"
      ? savedMeals
      : [...allMeals].sort((a, b) => {
          const aApproved = isMealApproved(a);
          const bApproved = isMealApproved(b);
          if (aApproved && !bApproved) return 1;
          if (!aApproved && bApproved) return -1;
          return 0;
        });

  const handleSubmit = () => {
    const fakeMeals = [
      {
        id: crypto.randomUUID(),
        name: "Greek Chicken Bowl",
        description: "Chicken with quinoa, cucumbers, and tzatziki.",
        ingredients: [],
        recipe: [],
      },
      {
        id: crypto.randomUUID(),
        name: "Egg White Scramble",
        description: "Egg whites with spinach and peppers.",
        ingredients: [],
        recipe: [],
      },
    ];

    setGeneratedMeals([...allMeals, ...fakeMeals]);
    inputRef.current = "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    inputRef.current = e.target.value;
  };

  const handleSelectPhasePrompt = (text: string, immediate: boolean) => {
    if (immediate) {
      // Future: Send to GPT immediately
    } else {
      inputRef.current = text;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters + Edit Preferences */}
      <div className="flex flex-wrap justify-between items-center px-4 py-3 border-b border-zinc-700 bg-black">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={clsx(
                "px-3 py-1 text-xs rounded-full border font-mono tracking-wide transition cursor-pointer",
                selectedFilter === type
                  ? "border-blue-500 text-blue-400 bg-zinc-800"
                  : "border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400"
              )}
            >
              {type[0].toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <button
          className="text-sm font-medium text-blue-400 hover:text-blue-300 transition"
          onClick={() => {
            window.location.href = "/step-three-planner";
          }}
        >
          Edit Preferences
        </button>
      </div>

      {/* Meal Cards */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={scrollContainerRef}
      >
        <MealCardList
          meals={filteredMeals}
          onApprove={handleApprove}
          onUnapprove={handleUnapprove}
          onRemove={handleRemove}
        />
      </div>

      {/* Sticky Footer */}
      <InputFooter
        input={inputRef.current}
        setInput={(val) => (inputRef.current = val)}
        handleFormSubmit={(e) => {
          e?.preventDefault();
          handleSubmit();
        }}
        handleTextareaChange={handleChange}
        isLoading={false}
        textareaRef={textareaRef}
        sendMessage={handleSelectPhasePrompt}
      />
    </div>
  );
}
