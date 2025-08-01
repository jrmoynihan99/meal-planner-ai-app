"use client";

import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import PlanProgressInfoOverlay from "./PlanProgressInfoOverlay";

interface FloatingPlanProgressButtonProps {
  overrideOnClick?: () => void;
}

function getRequiredMeals(mealsPerDay: number, variety: string): number {
  if (mealsPerDay === 2 || mealsPerDay === 3) {
    if (variety === "none") return 5;
    if (variety === "some") return 6;
    if (variety === "lots") return 7;
  }
  if (mealsPerDay === 4) {
    if (variety === "none") return 6;
    if (variety === "some") return 7;
    if (variety === "lots") return 8;
  }
  // Fallback: never less than mealsPerDay
  return Math.max(mealsPerDay, 5);
}

export default function FloatingPlanProgressButton({
  overrideOnClick,
}: FloatingPlanProgressButtonProps) {
  const approvedMeals = useAppStore((s) => s.stepThreeData?.approvedMeals);
  const mealsPerDay = useAppStore((s) => s.stepThreeData?.mealsPerDay || 1);
  const variety = useAppStore((s) => s.stepThreeData?.variety || "some");
  const totalRequired = Math.max(
    getRequiredMeals(mealsPerDay, variety),
    mealsPerDay
  );
  const approvedCount = approvedMeals?.length || 0;
  const progress = Math.min(approvedCount / totalRequired, 1);
  const isComplete = progress === 1;

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  useEffect(() => {
    if (isComplete && !hasAutoOpened) {
      setIsOverlayOpen(true);
      setHasAutoOpened(true);
    }
  }, [isComplete, hasAutoOpened]);

  return (
    <>
      <button
        onClick={overrideOnClick || (() => setIsOverlayOpen(true))}
        className="ml-2 flex-shrink-0 pointer-events-auto cursor-pointer"
        aria-label="Meal Plan Progress"
      >
        <motion.div
          className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border"
          style={{
            backgroundColor: isComplete ? "#1d4ed8" : "#000000",
            borderColor: isComplete ? "#1d4ed8" : "#3f3f46",
          }}
          animate={{
            scale: isComplete ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: isComplete ? 1.2 : 0.4,
            ease: "easeInOut",
            repeat: isComplete ? Infinity : 0,
          }}
        >
          {isComplete ? (
            <div className="flex items-center justify-center gap-1 text-white font-semibold text-sm">
              <span>{approvedCount}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          ) : (
            <>
              {/* Progress ring */}
              <svg
                className="absolute top-0 left-0 w-full h-full"
                viewBox="0 0 36 36"
              >
                <circle
                  className="text-zinc-700"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="16"
                />
                <motion.circle
                  className="text-blue-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="16"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                  strokeLinecap="round"
                  initial={false}
                  animate={{ strokeDashoffset: 100 - progress * 100 }}
                  transition={{ duration: 0.5 }}
                  transform="rotate(-90 18 18)"
                />
              </svg>

              {/* Inner text */}
              <div className="absolute inset-[4px] rounded-full bg-zinc-800 flex flex-col items-center justify-center text-white text-sm font-semibold">
                <div className="flex items-center gap-[2px] leading-none">
                  <span className="text-white text-[15px]">
                    {approvedCount}
                  </span>
                  <span className="text-zinc-400 text-[17px] font-bold">/</span>
                  <span className="text-white text-[15px]">
                    {totalRequired}
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </button>

      {!overrideOnClick && isOverlayOpen && (
        <PlanProgressInfoOverlay
          isComplete={isComplete}
          onClose={() => setIsOverlayOpen(false)}
        />
      )}
    </>
  );
}
