"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { CloseButton } from "@/components/CloseButton";
import { useAppStore } from "@/lib/store";

export default function StepTwoInfoOverlay({
  onClose,
  manuallyOpened = false,
}: {
  onClose: () => void;
  manuallyOpened?: boolean;
}) {
  const stepKey = "step-two-goal";
  const hiddenOverlays = useAppStore((s) => s.hiddenOverlays);
  const setOverlayHidden = useAppStore((s) => s.setOverlayHidden);
  const initiallyHidden = hiddenOverlays?.[stepKey] || false;

  const [dontShow, setDontShow] = useState(initiallyHidden);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const mobileControls = useAnimationControls();

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

  useEffect(() => {
    setDontShow(initiallyHidden);
  }, [initiallyHidden]);

  function handleClose() {
    // Only update the store if the checkbox value has changed from its initial state
    if (dontShow !== initiallyHidden) {
      // If this was manually opened and we're unchecking the box,
      // delay the store update to prevent immediate re-showing
      if (manuallyOpened && !dontShow) {
        setTimeout(() => {
          setOverlayHidden(stepKey, dontShow);
        }, 300); // After the exit animation completes
      } else {
        setOverlayHidden(stepKey, dontShow);
      }
    }

    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 200);
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
                transition: {
                  type: "tween",
                  ease: "easeIn",
                  duration: 0.25,
                },
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 h-[55vh] z-[9999] px-4"
            >
              <div className="relative w-full h-full">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-t-2xl blur-sm opacity-100 transition-all duration-500 ease-in-out" />
                <div
                  className="relative bg-zinc-900 border border-zinc-800 rounded-t-2xl pt-1.5 px-6 pb-6 h-full text-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-40 h-1.5 bg-zinc-600 rounded-full mx-auto mt-1 mb-6" />
                  <h2 className="text-lg font-semibold">
                    Set Your Goal and Pace
                  </h2>
                  <div className="text-sm text-zinc-300 mt-2">
                    Choose whether you want to lose, maintain, or gain weight —
                    and at what pace. We'll calculate your daily calorie and
                    protein targets based on this.
                  </div>
                  <label className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      checked={dontShow}
                      onChange={() => setDontShow(!dontShow)}
                    />
                    <span className="text-sm">Don't show this again</span>
                  </label>
                  <button
                    onClick={handleBackdropClick}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700"
                  >
                    Got it
                  </button>
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
                <div
                  className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-[360px] max-w-full text-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CloseButton
                    onClick={handleClose}
                    className="absolute top-3 right-3"
                  />
                  <h2 className="text-xl font-bold mb-2">
                    Set Your Goal and Pace
                  </h2>
                  <div className="text-sm text-zinc-300 mb-4">
                    Choose whether you want to lose, maintain, or gain weight —
                    and at what pace. We'll calculate your daily calorie and
                    protein targets based on this.
                  </div>
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={dontShow}
                      onChange={() => setDontShow(!dontShow)}
                    />
                    <span className="text-sm">Don't show this again</span>
                  </label>
                  <button
                    onClick={handleClose}
                    className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
