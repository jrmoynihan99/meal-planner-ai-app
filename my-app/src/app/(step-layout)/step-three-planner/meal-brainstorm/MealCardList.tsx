"use client";

import { useState } from "react";
import { Meal } from "./useMealBrainstormChat";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

interface MealCardListProps {
  meals: Meal[];
  onApprove: (meal: Meal) => void;
  onUnapprove: (meal: Meal) => void;
  onRemove: (index: number) => void;
}

export function MealCardList({
  meals,
  onApprove,
  onUnapprove,
  onRemove,
}: MealCardListProps) {
  const approvedMeals = useAppStore(
    (s) => s.stepThreeData?.approvedMeals ?? []
  );

  return (
    <div className="space-y-4 mt-6 max-w-full">
      {meals.map((meal, index) => (
        <EditableMealCard
          key={meal.id}
          meal={meal}
          index={index}
          onApprove={onApprove}
          onUnapprove={onUnapprove}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function EditableMealCard({
  meal,
  index,
  onApprove,
  onUnapprove,
  onRemove,
}: {
  meal: Meal;
  index: number;
  onApprove: (meal: Meal) => void;
  onUnapprove: (meal: Meal) => void;
  onRemove: (index: number) => void;
}) {
  const [showIngredients, setShowIngredients] = useState(false);
  const approvedMeals = useAppStore(
    (s) => s.stepThreeData?.approvedMeals ?? []
  );
  const isApproved = approvedMeals.some(
    (m) => m.name.toLowerCase() === meal.name.toLowerCase()
  );

  const toggleApprove = () => {
    if (isApproved) {
      onUnapprove(meal);
    } else {
      onApprove(meal);
    }
  };

  return (
    <div
      onClick={toggleApprove}
      className={`relative border rounded-xl p-4 shadow-md space-y-4 transition-all cursor-pointer select-none ${
        isApproved
          ? "border-blue-500 bg-zinc-800 hover:bg-zinc-700"
          : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
      }`}
    >
      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 p-1 cursor-pointer"
      >
        <Trash2 size={18} />
      </button>

      {/* Name + Description */}
      <div>
        <h3 className="text-lg font-semibold text-white">{meal.name}</h3>
        <p className="text-gray-400 text-sm mt-1">{meal.description}</p>
      </div>

      {/* Ingredients Accordion */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowIngredients((prev) => !prev);
        }}
        className="bg-zinc-900/80 border border-zinc-700 rounded-md text-sm text-blue-400 font-mono transition-all"
      >
        <div className="flex justify-between items-center px-4 py-2 cursor-pointer select-none">
          <span className="text-sm font-semibold">Ingredients</span>
          {showIngredients ? (
            <ChevronUp className="w-4 h-4 text-blue-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-400" />
          )}
        </div>

        <AnimatePresence initial={false}>
          {showIngredients && (
            <motion.ul
              key="ingredients"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden px-6 pb-3 list-disc list-inside text-gray-100 space-y-1"
            >
              {meal.ingredients.map((ing, i) => (
                <li key={i}>{ing.name}</li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Approval status + toggle */}
      <div className="flex justify-end mt-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              isApproved ? "text-blue-400" : "text-zinc-400"
            }`}
          >
            {isApproved ? "Approved" : "Not Approved"}
          </span>

          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleApprove();
            }}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              isApproved ? "bg-blue-600" : "bg-zinc-600"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                isApproved ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
