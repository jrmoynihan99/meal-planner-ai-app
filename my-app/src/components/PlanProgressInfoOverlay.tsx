"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { CloseButton } from "@/components/CloseButton";
import { GlowingButtonTwo } from "@/components/GlowingButtonTwo";
import { useAppStore } from "@/lib/store";
import FloatingPlanProgressButton from "./FloatingPlanProgressButton";

interface PlanProgressInfoOverlayProps {
  onClose: () => void;
  isComplete: boolean;
}

export default function PlanProgressInfoOverlay({
  onClose,
  isComplete,
}: PlanProgressInfoOverlayProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const mobileControls = useAnimationControls();

  const mealsPerDay = useAppStore.getState().stepThreeData?.mealsPerDay || 1;
  const totalRequired = Math.max(mealsPerDay, 5);
  const approvedCount =
    useAppStore.getState().stepThreeData?.approvedMeals.length || 0;
  const remainingMeals = Math.max(totalRequired - approvedCount, 0);
  const canGenerateFallback =
    approvedCount >= mealsPerDay && approvedCount < totalRequired;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile === true) {
      requestAnimationFrame(() => {
        mobileControls.start({ y: "25%" });
      });
    }
  }, [isMobile]);

  function handleClose() {
    setIsExiting(true);
    setTimeout(() => onClose(), 200);
  }

  async function handleBackdropClick() {
    if (isMobile) {
      await mobileControls.start({
        y: "100%",
        transition: { type: "tween", ease: "easeIn", duration: 0.25 },
      });
    }
    handleClose();
  }

  if (isMobile === null) return null;

  const title = isComplete ? "You're Ready!" : "Keep Going...";

  const renderButtons = () => {
    if (isComplete) {
      return (
        <div className="flex flex-col gap-3 mt-6">
          <GlowingButtonTwo
            text="Generate my plan"
            onClick={() => {
              console.log("Generating full plan...");
              handleClose();
            }}
            fullWidth
            animatedBorder
            className="bg-zinc-800/90 backdrop-blur-md border-zinc-700/70 shadow-xl"
          />

          <button
            onClick={handleClose}
            className="w-full text-sm text-zinc-300 hover:text-white underline"
          >
            Approve more meals
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={handleClose}
          className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700"
        >
          Approve{" "}
          <span className="font-semibold text-white">{remainingMeals}</span>{" "}
          More Meal{remainingMeals !== 1 ? "s" : ""}
        </button>

        {canGenerateFallback && (
          <button
            onClick={() => {
              console.log("Generating fallback plan...");
              handleClose();
            }}
            className="w-full border border-zinc-700 text-zinc-300 py-2 rounded-full hover:border-zinc-500 hover:text-white transition"
          >
            Generate Plan with {approvedCount} Meal
            {approvedCount !== 1 ? "s" : ""}
          </button>
        )}
      </div>
    );
  };

  const Content = () => (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex items-start gap-4">
        <div className="mt-[2px]">
          <FloatingPlanProgressButton overrideOnClick={() => {}} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="text-sm text-zinc-300 mt-1">
            {isComplete ? (
              <>
                You’ve approved enough meals to generate your weekly plan! Click
                below to let our AI handle the rest.
              </>
            ) : (
              <>
                We recommend approving at least{" "}
                <span className="font-semibold text-white">
                  {totalRequired}
                </span>{" "}
                meals for your weekly plan.
              </>
            )}
          </div>
        </div>
      </div>
      {renderButtons()}
    </div>
  );

  return (
    <AnimatePresence>
      {!isExiting && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={handleBackdropClick}
        >
          {isMobile ? (
            <motion.div
              drag="y"
              dragConstraints={{ top: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) handleClose();
              }}
              initial={{ y: "100%" }}
              animate={mobileControls}
              exit={{
                y: "100%",
                transition: { type: "tween", ease: "easeIn", duration: 0.25 },
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 h-[45vh] z-[9999] px-4"
            >
              <div className="relative w-full h-full">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-t-2xl blur-sm opacity-100 transition-all duration-500 ease-in-out" />
                <div className="relative bg-zinc-900 border border-zinc-800 rounded-t-2xl pt-1.5 px-6 pb-6 h-full text-white shadow-xl">
                  <div className="w-40 h-1.5 bg-zinc-600 rounded-full mx-auto mt-1 mb-6" />
                  <Content />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative inline-flex"
            >
              <div className="relative inline-flex group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition-all duration-500 ease-in-out" />
                <div className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-[360px] max-w-full text-white shadow-xl">
                  <CloseButton
                    onClick={handleClose}
                    className="absolute top-3 right-3"
                  />
                  <Content />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
