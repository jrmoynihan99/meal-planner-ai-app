"use client";

import { GoalTile } from "@/components/GoalTile";
import { useAppStore } from "@/lib/store";
import { GoalPaceBadge } from "@/components/GoalPaceBadge";
import NextStepButton from "@/components/NextStepButton";

const goals = [
  {
    title: "Fast Weight Loss",
    description: "Aggressive calorie deficit for fast fat loss.",
    colorClass: "text-red-400",
    calorieDelta: "-900",
  },
  {
    title: "Moderate Weight Loss",
    description: "Proper cutting phase, best for muscle preservation.",
    colorClass: "text-amber-400",
    calorieDelta: "-500",
  },
  {
    title: "Weight Maintenance",
    description: "Maintain your current weight, recomp with proper training",
    colorClass: "text-zinc-400",
    calorieDelta: "0",
  },
  {
    title: "Moderate Weight Gain",
    description:
      "Proper lean bulk. Steady muscle-building/weight gain strategy",
    colorClass: "text-amber-400",
    calorieDelta: "500",
  },
  {
    title: "Fast Weight Gain",
    description: "Higher calorie surplus for rapid mass or size increase.",
    colorClass: "text-red-400",
    calorieDelta: "900",
  },
];

export default function StepTwoGoalPage() {
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const stepOneData = useAppStore((s) => s.stepOneData);
  const stepTwoData = useAppStore((s) => s.stepTwoData);
  const setStepTwoData = useAppStore((s) => s.setStepTwoData);

  const selectedGoal = stepTwoData?.selectedGoalTitle ?? null;

  const handleSelect = (goal: (typeof goals)[number]) => {
    if (!stepOneData) return;

    const delta = parseInt(goal.calorieDelta);
    const goalCalories = stepOneData.maintanenceCalories + delta;
    const goalProtein =
      delta < 0
        ? Math.round(stepOneData.weight * 1.0)
        : Math.round(stepOneData.weight * 0.8);

    const text =
      delta === 0
        ? "maintenance"
        : `maintenance ${delta > 0 ? "+ " : "- "}${Math.abs(delta)}`;

    setStepTwoData({
      selectedGoalTitle: goal.title,
      goalCalories,
      goalProtein,
      calorieDelta: delta,
      calorieDeltaText: text,
    });
  };

  if (!hasHydrated || !stepOneData) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-pulse text-white text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <main className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const delta = parseInt(goal.calorieDelta);
              const calorieTarget = stepOneData.maintanenceCalories + delta;
              const proteinTarget =
                delta < 0
                  ? Math.round(stepOneData.weight * 1.0)
                  : Math.round(stepOneData.weight * 0.8);

              return (
                <GoalTile
                  key={goal.title}
                  title={goal.title}
                  description={goal.description}
                  calorieDelta={goal.calorieDelta}
                  isSelected={selectedGoal === goal.title}
                  onSelect={() => handleSelect(goal)}
                  weight={stepOneData.weight}
                  maintanenceCalories={stepOneData.maintanenceCalories}
                  calorieTarget={calorieTarget}
                  proteinTarget={proteinTarget}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      {selectedGoal && (
        <div className="sticky bottom-0 z-50 bg-zinc-900/95 border-t border-zinc-700 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 text-white text-sm font-mono flex items-center justify-between">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 uppercase text-xs tracking-wider text-zinc-400 mb-1">
                <span>Selected Goal:</span>
              </div>
              <div className="inline-flex items-center gap-2 text-blue-400 text-base">
                <span>{selectedGoal}</span>
                <GoalPaceBadge title={selectedGoal} />
              </div>
            </div>

            <NextStepButton href="/step-three-planner/meal-number" />
          </div>
        </div>
      )}
    </div>
  );
}
