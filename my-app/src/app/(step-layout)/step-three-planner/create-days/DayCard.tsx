"use client";

import React from "react";
import clsx from "clsx";

interface Ingredient {
  name: string;
  amount: string;
  protein: number;
  calories: number;
}

interface Meal {
  mealId: string;
  ingredients: Ingredient[];
  totalProtein: number;
  totalCalories: number;
}

interface DayData {
  id: string;
  meals: Meal[];
  dayProtein: number;
  dayCalories: number;
}

interface DayCardProps {
  day: DayData;
  index: number; // e.g., 0 for Day 1
}

export default function DayCard({ day, index }: DayCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-md mb-6 w-full">
      <h2 className="text-xl font-bold mb-3 text-white">Day {index + 1}</h2>

      <div className="text-sm text-zinc-300 mb-4">
        <span className="mr-4">
          🍽 Calories: <strong className="text-white">{day.dayCalories}</strong>
        </span>
        <span>
          💪 Protein: <strong className="text-white">{day.dayProtein}g</strong>
        </span>
      </div>

      <div className="space-y-5">
        {day.meals.map((meal, mealIndex) => (
          <div key={mealIndex} className="bg-zinc-800 p-3 rounded-xl">
            <h3 className="text-white font-semibold mb-2">
              Meal {mealIndex + 1}
            </h3>

            <ul className="text-sm text-zinc-400 space-y-1">
              {meal.ingredients.map((ing, i) => (
                <li key={i}>
                  <span className="text-white">{ing.name}</span>: {ing.amount} —{" "}
                  {ing.protein}g protein, {ing.calories} cal
                </li>
              ))}
            </ul>

            <div className="text-xs text-zinc-500 mt-2">
              Total: {meal.totalCalories} cal, {meal.totalProtein}g protein
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
