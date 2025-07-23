"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { GlowingButtonTwo } from "@/components/GlowingButtonTwo";
import { CloseButton } from "@/components/CloseButton";

import { useAppStore } from "@/lib/store";

interface Props {
  onClose: () => void;
  onGenerate: () => void;
}

export default function GenerateMoreMealsOverlay({
  onClose,
  onGenerate,
}: Props) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const mobileControls = useAnimationControls();

  const setMealBrainstormState = useAppStore((s) => s.setMealBrainstormState);

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

  const Content = () => (
    <div onClick={(e) => e.stopPropagation()}>
      <h2 className="text-lg font-semibold">Want More?</h2>
      <p className="text-sm text-zinc-300 mt-1">
        Generate more meals with your current preferences, or edit your
        preferences first.
      </p>

      <div className="flex flex-col gap-3 mt-6">
        <GlowingButtonTwo
          onClick={() => {
            onGenerate();
            handleClose();
          }}
          text="Generate More Meals"
          animatedBorder
          className="bg-zinc-800/90 backdrop-blur-md border-zinc-700/70 shadow-xl h-10 px-6 text-sm font-semibold"
          fullWidth
        />
        <button
          onClick={() => {
            setMealBrainstormState("editing");
            handleClose();
          }}
          className="w-full border border-zinc-700 text-zinc-300 py-2 rounded-full hover:border-zinc-500 hover:text-white transition"
        >
          Edit Preferences
        </button>
      </div>
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
