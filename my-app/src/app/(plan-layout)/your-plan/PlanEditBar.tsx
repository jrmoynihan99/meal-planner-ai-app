"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { VarietyDropdown } from "./VarietyDropdown";
import type { DayPlan } from "@/lib/store";
import { FloatingButton } from "./FloatingButton";

interface PlanEditBarProps {
  isOpen: boolean;
  onClose: () => void;
  allPlanOneDays: DayPlan[];
  allPlanTwoDays: DayPlan[];
  allPlanThreeDays: DayPlan[];
  children?: React.ReactNode; // For additional controls like ComboPicker
}

export function PlanEditBar({
  isOpen,
  onClose,
  allPlanOneDays,
  allPlanTwoDays,
  allPlanThreeDays,
  children,
}: PlanEditBarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
          className="
            fixed z-[100] bottom-6 left-1/2 -translate-x-1/2
            bg-zinc-800/70 shadow-2xl rounded-2xl
            flex items-center gap-4 px-4 py-3
            border border-zinc-800
            backdrop-blur-md
            w-[95vw] max-w-xl
          "
          style={{ pointerEvents: "auto" }}
        >
          <VarietyDropdown
            allPlanOneDays={allPlanOneDays}
            allPlanTwoDays={allPlanTwoDays}
            allPlanThreeDays={allPlanThreeDays}
          />
          {/* Insert your ComboPicker here */}
          {children}

          <FloatingButton
            icon={<Check size={26} />}
            onClick={onClose}
            ariaLabel="Done"
            className="ml-auto text-white bg-blue-500 hover:bg-blue-700 cursor-pointer"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
