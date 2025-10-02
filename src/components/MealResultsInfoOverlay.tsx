"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { CloseButton } from "@/components/CloseButton";
import { useAppStore } from "@/lib/store";
import { FilePen, Plus, Bookmark, BookmarkCheck } from "lucide-react";
import { SendIconButton } from "@/components/SendIconButton";
import FloatingPlanProgressButton from "@/components/FloatingPlanProgressButton";

export default function MealResultsInfoOverlay({
  onClose,
  manuallyOpened = false,
}: {
  onClose: () => void;
  manuallyOpened?: boolean;
}) {
  const stepKey = "step-three-results";
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
  }, [isMobile, mobileControls]);

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
              className="fixed bottom-0 left-0 right-0 h-[105vh] z-[9999] px-4"
            >
              <div className="relative w-full h-full">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-t-2xl blur-sm opacity-100 transition-all duration-500 ease-in-out" />
                <div
                  className="relative bg-zinc-900 border border-zinc-800 rounded-t-2xl pt-1.5 px-6 pb-6 h-full text-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-40 h-1.5 bg-zinc-600 rounded-full mx-auto mt-1 mb-6" />

                  <h2 className="text-lg font-semibold">
                    Refine & Approve Your Meals
                  </h2>

                  <div className="text-sm text-zinc-300 mt-2">
                    Approve at least <strong>5</strong> meals, up to as many as
                    you want. We will use and portion your approved meals for
                    your weekly meal plan!
                  </div>

                  {/* Important box
                  <div className="mt-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200">
                    <strong className="text-white">Important: </strong> You can
                    approve as many or as few meals as you want. We will use
                    these in your weekly meal plan.
                  </div>
                  <hr className="my-4 border-zinc-700" />*/}
                  <hr className="my-4 border-zinc-700" />

                  {/* Input preview */}
                  <div className="mt-4 text-sm text-zinc-400">
                    Use the AI input bar to make dynamic edits to existing
                    meals:
                    <div className="relative mt-3 w-full max-w-[95%] mx-auto pointer-events-none opacity-100">
                      <div className="absolute glow-static" />
                      <div className="absolute glow-focus opacity-100" />
                      <div className="relative flex items-center bg-zinc-800/90 backdrop-blur-md border border-zinc-700/70 rounded-3xl px-4 py-2 w-full min-h-[3.25rem] shadow-xl">
                        <span className="text-zinc-500 italic font-mono text-sm">
                          add parsley to the shrimp quinoa meal...
                        </span>
                        <div className="ml-auto text-white">
                          <div className="ml-auto">
                            <div className="p-2 rounded-full bg-blue-500 text-white opacity-70">
                              <SendIconButton
                                isAnimating={false}
                                onClick={() => {}}
                                colorClass="text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Button previews */}
                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button className="p-2 text-blue-500 hover:text-blue-400 transition cursor-pointer flex items-center justify-center">
                        <FilePen className="w-5 h-5" />
                      </button>
                      <div className="w-px h-6 bg-zinc-700 mx-2" />
                      <p className="text-zinc-400 flex-1">
                        Change your ingredient preferences before generating
                        more
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="p-2 text-blue-500 hover:text-blue-400 transition cursor-pointer flex items-center justify-center">
                        <Plus className="w-6 h-6" />
                      </button>
                      <div className="w-px h-6 bg-zinc-700 mx-2" />
                      <p className="text-zinc-400 flex-1">
                        Generate additional meals with your current preferences
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 opacity-70 pointer-events-none">
                        <BookmarkCheck className="w-5 h-5 text-yellow-400" />
                        <Bookmark className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="w-px h-6 bg-zinc-700 mx-2" />
                      <p className="text-zinc-400 flex-1">
                        Saved meals can be used later or added to future plans.
                      </p>
                    </div>

                    {/* Floating progress block */}
                    <div className="flex items-center gap-3">
                      <div className="opacity-70 pointer-events-none">
                        <FloatingPlanProgressButton
                          overrideOnClick={() => {}}
                        />
                      </div>
                      <div className="w-px h-6 bg-zinc-700 mx-2" />
                      <p className="text-zinc-400 flex-1">
                        Tracks how many meals you&#39;ve approved. Click for
                        more info.
                      </p>
                    </div>
                  </div>
                  <hr className="my-4 border-zinc-700" />

                  {/* Checkbox and close button */}
                  <label className="flex items-center gap-3 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dontShow}
                      onChange={() => setDontShow(!dontShow)}
                      className="h-4 w-4 text-blue-600 bg-zinc-900 border border-zinc-700 rounded-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-300 select-none">
                      Don&#39;t show this again
                    </span>
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
                  className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-[560px] max-w-full text-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CloseButton
                    onClick={handleClose}
                    className="absolute top-3 right-3"
                  />
                  <h2 className="text-xl font-bold mb-2">
                    Refine & Approve Your Meals
                  </h2>

                  <div className="text-sm text-zinc-300">
                    Approve at least <strong>5</strong> meals, up to as many as
                    you want. We will use and portion your approved meals for
                    your weekly meal plan!
                  </div>
                  {/*
                  <div className="mt-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200">
                    <strong className="text-white">Important:</strong> You can
                    approve as many or as few meals as you want. We’ll only use
                    the ones you approve when building your weekly plan.
                  </div>*/}

                  <hr className="my-4 border-zinc-700" />

                  {/* Input bar preview */}
                  <div className="mt-4 text-sm text-zinc-400">
                    Use the AI input bar to make dynamic edits to existing
                    meals:
                    <div className="relative mt-3 w-full max-w-[95%] mx-auto pointer-events-none opacity-100">
                      <div className="absolute glow-static" />
                      <div className="absolute glow-focus opacity-100" />
                      <div className="relative flex items-center bg-zinc-800/90 backdrop-blur-md border border-zinc-700/70 rounded-3xl px-4 py-2 w-full min-h-[3.25rem] shadow-xl">
                        <span className="text-zinc-500 italic font-mono text-sm">
                          e.g. remove parsley from the shrimp quinoa meal...
                        </span>
                        <div className="ml-auto">
                          <div className="p-2 rounded-full bg-blue-500 text-white opacity-70">
                            <SendIconButton
                              isAnimating={false}
                              onClick={() => {}}
                              colorClass="text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Button previews */}
                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button
                        disabled
                        className="px-3 py-2 flex items-center gap-2 text-sm font-semibold text-white bg-blue-600/80 rounded-xl opacity-70 pointer-events-none"
                      >
                        <FilePen className="w-4 h-4" />
                        Edit Preferences
                      </button>
                      <div className="w-px h-6 bg-zinc-700 mx-2" />
                      <p className="text-zinc-400 flex-1">
                        Change your ingredient preferences before generating
                        more
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        disabled
                        className="px-3 py-2 flex items-center gap-2 text-sm font-semibold text-white bg-blue-600/80 rounded-xl opacity-70 pointer-events-none"
                      >
                        <Plus className="w-4 h-4" />
                        Generate More Meals
                      </button>
                      <div className="w-px h-6 bg-zinc-700 mx-2" />
                      <p className="text-zinc-400 flex-1">
                        Generate additional meals with your current preferences
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 opacity-70 pointer-events-none">
                        <BookmarkCheck className="w-5 h-5 text-yellow-400" />
                        <Bookmark className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="w-px h-6 bg-zinc-700 mx-2" />
                      <p className="text-zinc-400 flex-1">
                        Saved meals can be used later or added to future plans.
                      </p>
                    </div>

                    {/* Floating progress block */}
                    <div className="flex items-center gap-3">
                      <div className="opacity-70 pointer-events-none">
                        <FloatingPlanProgressButton
                          overrideOnClick={() => {}}
                        />
                      </div>
                      <div className="w-px h-6 bg-zinc-700 mx-2" />
                      <p className="text-zinc-400 flex-1">
                        Tracks how many meals you&#39;ve approved. Click for
                        more info.
                      </p>
                    </div>
                  </div>

                  <hr className="my-4 border-zinc-700" />

                  {/* Don't show again + Got it */}
                  <label className="flex items-center gap-3 mt-4 cursor-pointer">
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
