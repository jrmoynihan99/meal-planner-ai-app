"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import TypewriterReveal from "@/components/TypewriterReveal";
import { AnimatePresence, motion } from "framer-motion";
import { GlowingButton } from "@/components/GlowingButton";
import { handleStart } from "./handleStart";
import DayCard from "./DayCard";
import Image from "next/image";
import type { DayPlan } from "@/lib/store";
import NextStepButton from "@/components/NextStepButton";
import { GeneralInfoOverlay } from "@/components/GeneralInfoOverlay";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function DayGenerationPage() {
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const allDays = stepThreeData?.allDays ?? [];
  const approvedDays = stepThreeData?.approvedDays ?? [];
  const unapprovedDays = stepThreeData?.unapprovedDays ?? [];
  const dayGenerationState = stepThreeData?.dayGenerationState ?? "not_started";

  const [showApprovalInfo, setShowApprovalInfo] = useState(false);

  const toggleDayApproval = (day: DayPlan) => {
    const isApproved = approvedDays.some((d) => d.id === day.id);

    if (isApproved) {
      setStepThreeData({
        approvedDays: approvedDays.filter((d) => d.id !== day.id),
        unapprovedDays: [...unapprovedDays, day],
      });
    } else {
      setStepThreeData({
        approvedDays: [...approvedDays, day],
        unapprovedDays: unapprovedDays.filter((d) => d.id !== day.id),
      });
    }
  };

  const reorderMealsInDay = (dayId: string, newMealOrder: string[]) => {
    const reorder = (list: DayPlan[]) =>
      list.map((day) => {
        if (day.id !== dayId) return day;
        const reorderedMeals = newMealOrder
          .map((mealId) => day.meals.find((meal) => meal.mealId === mealId))
          .filter((m): m is NonNullable<typeof m> => !!m);
        return { ...day, meals: reorderedMeals };
      });

    setStepThreeData({
      ...stepThreeData,
      allDays: reorder(allDays),
      approvedDays: reorder(approvedDays),
      unapprovedDays: reorder(unapprovedDays),
    });
  };

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
    <>
      {dayGenerationState === "completed" ? (
        <main className="bg-black text-white px-4 py-8 sm:p-6 max-w-6xl mx-auto font-sans w-full h-full overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {allDays.map((day) => {
              const isApproved = approvedDays.some((d) => d.id === day.id);
              return (
                <DayCard
                  key={day.id}
                  day={day}
                  isApproved={isApproved}
                  onToggleApproval={() => toggleDayApproval(day)}
                  onReorderMeals={reorderMealsInDay}
                />
              );
            })}
          </div>
        </main>
      ) : (
        <main className="min-h-screen bg-black text-white px-4 py-8 sm:p-6 max-w-6xl mx-auto font-sans w-full">
          {dayGenerationState === "not_started" && (
            <>
              <div className="flex flex-col items-center justify-center text-center h-[160px] sm:h-[180px]">
                <TypewriterReveal
                  lines={[
                    "Now that you've approved your meals...",
                    "It's time to build your actual days of eating.",
                    "Click below to let our AI work its magic",
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
                />
              </div>
              <div className="mt-6 h-6 w-full text-white text-sm sm:text-base relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {loadingTexts[currentIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </main>
      )}

      {dayGenerationState === "completed" && (
        <>
          <div className="sticky bottom-0 z-50 bg-zinc-900/95 border-t border-zinc-700 backdrop-blur-md w-full">
            {approvedDays.length < 1 ? (
              <div className="w-full px-4 md:px-8 py-4 text-white text-sm font-mono flex items-center justify-center max-w-6xl mx-auto">
                <span className="flex items-center gap-2 text-zinc-400">
                  Approve at least 1 day of eating to continue
                  <InfoOutlinedIcon
                    fontSize="small"
                    className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors"
                    onClick={() => setShowApprovalInfo(true)}
                  />
                </span>
              </div>
            ) : (
              <div className="w-full px-4 md:px-8 py-4 text-white text-sm font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="uppercase text-xs tracking-wider text-zinc-400">
                    DAYS APPROVED
                  </span>
                  <span className="bg-zinc-800 px-2 py-0.5 rounded-md text-blue-400 text-base border border-zinc-700">
                    {approvedDays.length}
                  </span>
                </div>

                <NextStepButton href="/step-three-planner/weekly-assignment" />
              </div>
            )}
          </div>

          {showApprovalInfo && (
            <GeneralInfoOverlay
              onClose={() => setShowApprovalInfo(false)}
              subheading="WHAT'S THIS?"
              title="Day Approval"
              description="You must approve at least one full day of eating. These are the days that you will be repeating throughout the week, so select enough variety where you can stick with it. The last step will be weekly assignment of these approved days!"
            />
          )}
        </>
      )}
    </>
  );
}
