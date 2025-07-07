"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import TypewriterReveal from "@/components/TypewriterReveal";
import { AnimatePresence } from "framer-motion";
import { GlowingButton } from "@/components/GlowingButton";
import { handleStart } from "./handleStart";
import DayCard from "./DayCard";

export default function DayGenerationPage() {
  const dayGenerationState = useAppStore(
    (s) => s.stepThreeData?.dayGenerationState ?? "not_started"
  );
  const allGeneratedDays = useAppStore(
    (s) => s.stepThreeData?.allGeneratedDays ?? []
  );

  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  const [showStartUI, setShowStartUI] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setStepThreeData({
        allGeneratedDays: [],
        dayGenerationState: "not_started",
      });
    }
  }, []);

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
                <GlowingButton onClick={handleStart} text="GET STARTED" />
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
        <div className="mt-8">
          <h2 className="text-center text-white text-xl font-bold mb-6">
            Your days have been generated!
          </h2>
          <div className="space-y-6">
            {allGeneratedDays.map((day, index) => (
              <DayCard key={day.id} day={day} index={index} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
