"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Meal } from "@/lib/store";
import { EditableMealCard } from "./EditableMealCard";

interface MealCardListProps {
  meals: Meal[];
  onApprove: (meal: Meal) => void;
  onUnapprove: (meal: Meal) => void;
  onSave: (meal: Meal) => void;
  onUnsave: (meal: Meal) => void;
  onRemove: (meal: Meal) => void;
}

export function MealCardList({
  meals,
  onApprove,
  onUnapprove,
  onSave,
  onUnsave,
  onRemove,
}: MealCardListProps) {
  return (
    <div className="grid gap-4 max-w-full grid-cols-1 sm:grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {[...meals].map((meal) => (
          <motion.div
            key={meal.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <EditableMealCard
              meal={meal}
              onApprove={onApprove}
              onUnapprove={onUnapprove}
              onSave={onSave}
              onUnsave={onUnsave}
              onRemove={onRemove}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
