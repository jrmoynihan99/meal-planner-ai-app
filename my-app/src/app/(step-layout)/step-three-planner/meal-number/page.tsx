"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { GeneralInfoOverlay } from "@/components/GeneralInfoOverlay";
import { useAppStore } from "@/lib/store";
import NextStepButton from "@/components/NextStepButton";

// Separate arrays for each question
const mealsPerDayOptions = [2, 3, 4, 5];
const uniqueMealsOptions = [3, 5, 7, 10];

export default function MealNumberPage() {
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  const [mealsPerDay, setMealsPerDay] = useState<number | null>(null);
  const [uniqueMeals, setUniqueMeals] = useState<number | null>(null);

  const [customMealsPerDay, setCustomMealsPerDay] = useState(0);
  const [customUniqueMeals, setCustomUniqueMeals] = useState(0);

  const [showMealsPerDayInfo, setShowMealsPerDayInfo] = useState(false);
  const [showUniqueMealsInfo, setShowUniqueMealsInfo] = useState(false);

  // Hydration and reset handler
  useEffect(() => {
    if (stepThreeData?.mealsPerDay && stepThreeData.mealsPerDay > 0) {
      setMealsPerDay(stepThreeData.mealsPerDay);
      if (!mealsPerDayOptions.includes(stepThreeData.mealsPerDay)) {
        setCustomMealsPerDay(stepThreeData.mealsPerDay);
      }
    } else {
      setMealsPerDay(null);
      setCustomMealsPerDay(0);
    }

    if (
      stepThreeData?.uniqueWeeklyMeals &&
      stepThreeData.uniqueWeeklyMeals > 0
    ) {
      setUniqueMeals(stepThreeData.uniqueWeeklyMeals);
      if (!uniqueMealsOptions.includes(stepThreeData.uniqueWeeklyMeals)) {
        setCustomUniqueMeals(stepThreeData.uniqueWeeklyMeals);
      }
    } else {
      setUniqueMeals(null);
      setCustomUniqueMeals(0);
    }
  }, [stepThreeData?.mealsPerDay, stepThreeData?.uniqueWeeklyMeals]);

  return (
    <main className="px-4 pt-8 pb-32 max-w-xl mx-auto">
      {/* Meals per day */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-white">
            How many meals do you want to eat per day?
          </h2>
          <Info
            className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => setShowMealsPerDayInfo(true)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {mealsPerDayOptions.map((n) => (
            <button
              key={n}
              onClick={() => {
                setMealsPerDay(n);
                setStepThreeData({ mealsPerDay: n });
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border transition
              ${
                mealsPerDay === n
                  ? "border-blue-500 bg-blue-500/20 text-blue-400"
                  : "border-zinc-600 hover:border-zinc-400 text-white"
              }`}
            >
              {n}
            </button>
          ))}

          {/* Custom button */}
          <button
            onClick={() => {
              setMealsPerDay(customMealsPerDay);
              setStepThreeData({ mealsPerDay: customMealsPerDay });
            }}
            className={`px-4 h-12 rounded-xl flex items-center justify-center text-sm font-semibold border transition
            ${
              mealsPerDay === customMealsPerDay && customMealsPerDay > 0
                ? "border-blue-500 bg-blue-500/20 text-blue-400"
                : "border-zinc-600 hover:border-zinc-400 text-white"
            }`}
          >
            Custom
          </button>

          {mealsPerDay === customMealsPerDay && (
            <input
              type="number"
              value={customMealsPerDay || ""}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCustomMealsPerDay(val);
                setMealsPerDay(val);
                setStepThreeData({ mealsPerDay: val });
              }}
              placeholder="Enter custom number"
              className="mt-3 w-32 px-3 py-2 rounded-md border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* Unique meals per week */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-white">
            How many unique meals do you want to eat per week?
          </h2>
          <Info
            className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => setShowUniqueMealsInfo(true)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {uniqueMealsOptions.map((n) => (
            <button
              key={n}
              onClick={() => {
                setUniqueMeals(n);
                setStepThreeData({ uniqueWeeklyMeals: n });
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border transition
              ${
                uniqueMeals === n
                  ? "border-blue-500 bg-blue-500/20 text-blue-400"
                  : "border-zinc-600 hover:border-zinc-400 text-white"
              }`}
            >
              {n}
            </button>
          ))}

          {/* Custom button */}
          <button
            onClick={() => {
              setUniqueMeals(customUniqueMeals);
              setStepThreeData({ uniqueWeeklyMeals: customUniqueMeals });
            }}
            className={`px-4 h-12 rounded-xl flex items-center justify-center text-sm font-semibold border transition
            ${
              uniqueMeals === customUniqueMeals && customUniqueMeals > 0
                ? "border-blue-500 bg-blue-500/20 text-blue-400"
                : "border-zinc-600 hover:border-zinc-400 text-white"
            }`}
          >
            Custom
          </button>

          {uniqueMeals === customUniqueMeals && (
            <input
              type="number"
              value={customUniqueMeals || ""}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCustomUniqueMeals(val);
                setUniqueMeals(val);
                setStepThreeData({ uniqueWeeklyMeals: val });
              }}
              placeholder="Enter custom number"
              className="mt-3 w-32 px-3 py-2 rounded-md border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* Info overlays */}
      {showMealsPerDayInfo && (
        <GeneralInfoOverlay
          onClose={() => setShowMealsPerDayInfo(false)}
          subheading="Meals Per Day"
          title="How many times per day do you eat?"
          description="This will help us divide your calories and protein evenly across your day. Most people choose 3 meals and 1–2 snacks."
        />
      )}

      {showUniqueMealsInfo && (
        <GeneralInfoOverlay
          onClose={() => setShowUniqueMealsInfo(false)}
          subheading="Unique Meals"
          title="How much variety do you want?"
          description="You can choose just a few meals to repeat or a wider variety. For example, you might eat the same breakfast daily but vary your lunches and dinners."
        />
      )}
      {mealsPerDay && uniqueMeals && (
        <div className="fixed bottom-6 right-6 z-10">
          <NextStepButton href="/step-three-planner/meal-brainstorm" />
        </div>
      )}
    </main>
  );
}
