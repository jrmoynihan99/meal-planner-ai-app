"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { generateDayCombinations } from "@/utils/day-combinations";
import { findValidDaySets } from "@/utils/findValidDaySets";
import { generateRandomOrderings } from "@/utils/generate-random-orderings";
import { Meal } from "@/lib/store";
import { solveOrderingSequence } from "@/utils/solveOrderingSequence";
import { buildZustandDayPlans } from "@/utils/buildZustandDayPlans";
import { buildWeeklySchedulesWithVariety } from "@/utils/buildWeeklySchedulesWithVariety";
import type { OrderingResult } from "@/utils/solveOrderingSequence";

const loadingTexts = [
  "Cooking up your meals...",
  "Measuring macros...",
  "Chopping veggies...",
  "Preheating GPT...",
  "Plating your plan...",
];

export default function GenerateLoadingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use the hook, not .getState()
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const stepTwoData = useAppStore((s) => s.stepTwoData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);

  // Animate loading text cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true; // For cleanup

    if (
      !stepThreeData?.approvedMeals ||
      !stepThreeData.mealsPerDay ||
      !stepTwoData?.goalCalories ||
      !stepTwoData?.goalProtein
    ) {
      console.log("[page.tsx] Missing required data, not running solver.");
      return;
    }

    (async () => {
      console.log("[page.tsx] Starting solver pipeline...");
      console.log("[page.tsx] Meals per day:", stepThreeData.mealsPerDay);
      console.log(
        "[page.tsx] Approved meals:",
        stepThreeData.approvedMeals.map((m) => m.name)
      );

      const mealData: Record<string, Meal> = {};
      for (const meal of stepThreeData.approvedMeals) {
        mealData[meal.name] = meal;
      }

      // Generates all day combinations in isolation (meals move across days)
      const combos = generateDayCombinations(
        stepThreeData.approvedMeals,
        stepThreeData.mealsPerDay
      );
      console.log("[page.tsx] Returned All Individual Valid Days:", combos);

      // Find valid sets of days based on slot-unique meal assignment
      const validSets = findValidDaySets(combos);
      console.log(
        "[page.tsx] All Valid SETS of days (slot-unique):",
        validSets
      );

      // logic currently built for multiple orderings, but we've coded "1" so there's only 1 iteration of outer loop.
      // Holds all bestResults arrays, one per valid set
      const allBestResults: OrderingResult[][] = [];
      // Array of just the one chosen per set
      const chosenResults: OrderingResult[] = [];

      for (let setIdx = 0; setIdx < validSets.length; setIdx++) {
        const validSet = validSets[setIdx];
        // Get ONE random ordering of the days in each ValidSet (solver only needs 1)
        const orderings = generateRandomOrderings(validSet, 1);
        console.log(
          `[page.tsx][Set ${setIdx + 1}] Generated orderings:`,
          orderings
        );

        const results = [];
        for (let i = 0; i < orderings.length; i++) {
          const ordering = orderings[i];
          console.log(
            `[page.tsx][Set ${setIdx + 1}] Solving ordering #${i + 1}/${
              orderings.length
            }:`,
            ordering
          );
          try {
            const result = await solveOrderingSequence(
              ordering,
              mealData,
              stepTwoData.goalCalories,
              stepTwoData.goalProtein
            );
            console.log(
              `[page.tsx][Set ${setIdx + 1}] Result for ordering #${i + 1}:`,
              result
            );
            results.push(result);
          } catch (err) {
            console.error(
              `[page.tsx][Set ${setIdx + 1}] Error in solveOrderingSequence:`,
              err
            );
            results.push(null);
          }
        }

        // Find the max validDays in this set
        const maxValidDays = results.reduce((max, curr) => {
          if (!curr) return max;
          return curr.validDays > max ? curr.validDays : max;
        }, 0);

        // Gather all results with maxValidDays for this set
        const bestResults: OrderingResult[] = results.filter(
          (curr): curr is OrderingResult =>
            curr !== null && curr.validDays === maxValidDays
        );

        // Randomly pick ONE from bestResults
        let chosen: OrderingResult | null = null;
        if (bestResults.length > 0) {
          const randIdx = Math.floor(Math.random() * bestResults.length);
          chosen = bestResults[randIdx];
          chosenResults.push(chosen);
        }

        allBestResults.push(bestResults);
      }

      // Final selection: one picked from each set
      console.log("[page.tsx] === ONE CHOSEN RESULT PER VALID SET ===");
      console.log(chosenResults);
      console.log("[page.tsx] Calling DayPlan Formatter");
      //format the returned data into DayPlan objects
      const { allPlanOneDays, allPlanTwoDays, allPlanThreeDays } =
        buildZustandDayPlans(
          chosenResults,
          stepThreeData.approvedMeals // pass in your approvedMeals array
        );

      console.log("[page.tsx] allPlanOneDays:", allPlanOneDays);
      console.log("[page.tsx] allPlanTwoDays:", allPlanTwoDays);
      console.log("[page.tsx] allPlanThreeDays:", allPlanThreeDays);

      let variety: "none" | "less" | "moderate";
      if (allPlanOneDays.length > 5) {
        variety = "moderate";
      } else if (allPlanOneDays.length > 2) {
        variety = "less";
      } else {
        variety = "none";
      }
      // Now update Zustand with these arrays
      setStepThreeData({
        allPlanOneDays,
        allPlanTwoDays,
        allPlanThreeDays,
        variety,
      });

      // Get Weekly Schedules setup with moderate variety
      console.log("[page.tsx] Calling WeeklySchedule builder");
      const planIndices = [1, 2, 3];

      const { weeklySchedule, weeklyScheduleTwo, weeklyScheduleThree } =
        buildWeeklySchedulesWithVariety(planIndices, variety, {
          allPlanOneDays,
          allPlanTwoDays,
          allPlanThreeDays,
        });

      console.log("[page.tsx] weeklySchedule:", weeklySchedule);
      console.log("[page.tsx] weeklyScheduleTwo:", weeklyScheduleTwo);
      console.log("[page.tsx] weeklyScheduleThree:", weeklyScheduleThree);

      // 5. Update weekly schedules in Zustand
      setStepThreeData({
        ...(weeklySchedule && { weeklySchedule }),
        ...(weeklyScheduleTwo && { weeklyScheduleTwo }),
        ...(weeklyScheduleThree && { weeklyScheduleThree }),
      });

      // Redirect to /your-plan if still mounted
      if (isMounted) {
        router.push("/your-plan");
      }
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stepThreeData?.approvedMeals,
    stepThreeData?.mealsPerDay,
    stepTwoData?.goalCalories,
    stepTwoData?.goalProtein,
  ]);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <Image
        src="/onion-bounce-background.gif"
        alt="Generating meals..."
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
  );
}
