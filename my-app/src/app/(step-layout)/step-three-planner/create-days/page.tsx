"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import TypewriterReveal from "@/components/TypewriterReveal";
import { AnimatePresence } from "framer-motion";
import { GlowingButton } from "@/components/GlowingButton";

export default function DayGenerationPage() {
  const dayGenerationState = useAppStore(
    (s) => s.stepThreeData?.dayGenerationState ?? "not_started"
  );
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  const [showStartUI, setShowStartUI] = useState(false);

  const handleStart = () => {
    setStepThreeData({ dayGenerationState: "started" });
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 sm:p-6 max-w-3xl mx-auto font-sans">
      {/* NOT STARTED */}
      {dayGenerationState === "not_started" && (
        <>
          <div className="flex flex-col items-center justify-center text-center h-[160px] sm:h-[180px]">
            <TypewriterReveal
              lines={[
                "Now that you’ve approved your meals...",
                "It’s time to build your actual days of eating.",
                "Click below to let our AI work it's magic",
              ]}
              typingSpeed={20}
              delayBetween={400}
              className="text-xl sm:text-2xl font-mono"
              onComplete={() => setShowStartUI(true)}
            />
          </div>

          {showStartUI && (
            <div className="w-full flex justify-center mt-6">
              <AnimatePresence>
                <GlowingButton
                  onClick={handleStart}
                  text="Generate First Day"
                />
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* STARTED */}
      {dayGenerationState === "started" && (
        <div className="mt-10 text-center text-zinc-400">
          Generating your first day of eating...
        </div>
      )}

      {/* COMPLETED */}
      {dayGenerationState === "completed" && (
        <div className="mt-10 text-center text-zinc-400">
          Your days have been generated!
        </div>
      )}
    </main>
  );
}
