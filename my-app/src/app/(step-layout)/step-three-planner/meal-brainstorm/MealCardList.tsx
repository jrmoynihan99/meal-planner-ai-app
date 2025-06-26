"use client";

import { Meal } from "./useMealBrainstormChat";

interface MealCardListProps {
  meals: Meal[];
  onApprove: (meal: Meal) => void;
  onTweak: (index: number) => void;
  onReplace: (index: number) => void;
}

export function MealCardList({
  meals,
  onApprove,
  onTweak,
  onReplace,
}: MealCardListProps) {
  return (
    <div className="space-y-4 mt-6">
      {meals.map((meal, index) => (
        <div
          key={index}
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 shadow-md space-y-2"
        >
          <h3 className="text-lg text-blue-400 font-semibold">{meal.name}</h3>
          <p className="text-gray-300">{meal.description}</p>
          <ul className="text-sm text-white list-disc list-inside space-y-1 mt-2">
            {meal.ingredients.map((ing, i) => (
              <li key={i}>
                {ing.amount} {ing.name}
              </li>
            ))}
          </ul>
          <div className="flex gap-3 mt-4">
            <button
              className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
              onClick={() => onApprove(meal)}
            >
              ✅ Approve
            </button>
            <button
              className="px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
              onClick={() => onTweak(index)}
            >
              ✏️ Tweak
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm"
              onClick={() => onReplace(index)}
            >
              🔁 Replace
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
