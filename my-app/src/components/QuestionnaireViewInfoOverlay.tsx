"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { CloseButton } from "@/components/CloseButton";
import { useAppStore } from "@/lib/store";
import { GlowingButtonTwo } from "@/components/GlowingButtonTwo";
import { ArrowRight } from "lucide-react";

export default function QUestionnaireViewInfoOverlay({
  onClose,
  manuallyOpened = false,
}: {
  onClose: () => void;
  manuallyOpened?: boolean;
}) {
  const stepKey = "step-three-questionnaire";
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
              className="fixed bottom-0 left-0 right-0 h-[75vh] z-[9999] px-4"
            >
              <div className="relative w-full h-full">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-t-2xl blur-sm opacity-100 transition-all duration-500 ease-in-out" />
                <div
                  className="relative bg-zinc-900 border border-zinc-800 rounded-t-2xl pt-1.5 px-6 pb-6 h-full text-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-40 h-1.5 bg-zinc-600 rounded-full mx-auto mt-1 mb-6" />
                  <h2 className="text-lg font-semibold">
                    Choose Your Preferences
                  </h2>
                  <div className="text-sm text-zinc-300 mt-2">
                    Select your favorite foods! These preferences help guide our
                    AI towards your tastes and generate meals you&#39;ll
                    actually want to eat.
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200">
                    <strong className="text-white">Important: </strong>
                    This step is completely optional. You can skip it to give
                    our AI full flexibility.
                  </div>
                  {/* Button instruction preview */}
                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex items-center gap-3">
                      <GlowingButtonTwo
                        onClick={() => {}}
                        text="Generate Meals"
                        className="pointer-events-none opacity-70 w-1/2"
                      />
                      <p className="text-zinc-400 flex-1">
                        Creates meals based on your preferences
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        disabled
                        className="relative inline-flex items-center justify-center px-6 py-3 text-white font-semibold text-sm uppercase tracking-wide rounded-full bg-blue-600/90 backdrop-blur-md border border-blue-600/70 shadow-xl pointer-events-none opacity-70 w-1/2"
                      >
                        View Meals
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                      <p className="text-zinc-400 flex-1">
                        Switch tabs to view your meal recommendations
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      checked={dontShow}
                      onChange={() => setDontShow(!dontShow)}
                    />
                    <span className="text-sm">Don&#39;t show this again</span>
                  </label>
                  <button
                    onClick={handleBackdropClick}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 cursor-pointer"
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
                  className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-[560px] max-w-full text-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CloseButton
                    onClick={handleClose}
                    className="absolute top-3 right-3"
                  />
                  <h2 className="text-xl font-bold mb-3">
                    Choose Your Preferences
                  </h2>

                  <div className="text-sm text-zinc-300">
                    Select your favorite foods! These preferences help guide our
                    AI towards your tastes and generate meals you&#39;ll
                    actually want to eat.
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200">
                    <strong className="text-white">Important: </strong> This
                    step is completely optional. You can skip it to give our AI
                    full flexibility.
                  </div>

                  {/* Instructional buttons */}
                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex items-center gap-3">
                      <GlowingButtonTwo
                        onClick={() => {}}
                        text="Generate Meals"
                        className="pointer-events-none opacity-70 w-1/2"
                      />
                      <p className="text-zinc-400 flex-1">
                        Creates meals based on your preferences
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        disabled
                        className="relative inline-flex items-center justify-center px-6 py-3 text-white font-semibold text-sm uppercase tracking-wide rounded-full bg-blue-600/90 backdrop-blur-md border border-blue-600/70 shadow-xl pointer-events-none opacity-70 w-1/2"
                      >
                        View Meals
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                      <p className="text-zinc-400 flex-1">
                        Switch tabs to view your meal recommendations
                      </p>
                    </div>
                  </div>

                  {/* Restyled checkbox */}
                  <label className="flex items-center gap-3 mt-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dontShow}
                      onChange={() => setDontShow(!dontShow)}
                      className="h-4 w-4 text-blue-600 bg-zinc-900 border border-zinc-700 rounded-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-300 select-none">
                      Don’t show this again
                    </span>
                  </label>

                  <button
                    onClick={handleClose}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 cursor-pointer"
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
