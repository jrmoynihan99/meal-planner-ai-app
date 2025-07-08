"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import TypewriterReveal from "@/components/TypewriterReveal";
import { AnimatePresence, motion } from "framer-motion";
import { GlowingButton } from "@/components/GlowingButton";
import { handleStart } from "./handleStart";
import DayCard from "./DayCard";
import Image from "next/image";

export default function DayGenerationPage() {
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const [showStartUI, setShowStartUI] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadingTexts = [
    "Gathering calorie data...",
    "Portioning meals...",
    "Creating days...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ❗Only access Zustand data *after* hydration
  const dayGenerationStateRaw = useAppStore(
    (s) => s.stepThreeData?.dayGenerationState
  );
  const allGeneratedDaysRaw = useAppStore(
    (s) => s.stepThreeData?.allGeneratedDays
  );

  const dayGenerationState = hasHydrated
    ? dayGenerationStateRaw ?? "not_started"
    : "not_started";

  const allGeneratedDays = hasHydrated ? allGeneratedDaysRaw ?? [] : [];

  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  if (!hasHydrated) {
    return (
      <div className="flex h-full w-full bg-black text-white justify-center items-center">
        <span className="text-gray-400 animate-pulse">
          Loading your data...
        </span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 sm:p-6 max-w-3xl mx-auto font-sans">
      {/* NOT STARTED */}
      {dayGenerationState === "not_started" && (
        <>
          <div className="flex flex-col items-center justify-center text-center h-[160px] sm:h-[180px]">
            <TypewriterReveal
              lines={[
                "Now that you've approved your meals...",
                "It's time to build your actual days of eating.",
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
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <Image
            src="/onion-bounce-background.gif"
            alt="Generating day plan..."
            width={400}
            height={400}
            className="mb-6"
          />
          <div className="w-[300px] h-2 mt-8 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 animate-loadingBar"
              style={{ width: "100%" }}
            ></div>
          </div>
          <div className="mt-6 h-6 w-full text-white text-sm sm:text-base relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: -20 }} // Starts above
                animate={{ opacity: 1, y: 0 }} // Moves down into view
                exit={{ opacity: 0, y: 30 }} // Continues down and fades out
                transition={{ duration: 1.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {loadingTexts[currentIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
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
