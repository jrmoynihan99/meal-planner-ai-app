"use client";

import { useRef } from "react";
import { useAppStore } from "@/lib/store";
import QuestionnaireView from "./QuestionnaireView";
import LoadingScreen from "./LoadingScreen";
import MealResultsView from "./MealResultsView";

export default function MealBrainstormPage() {
  const mealBrainstormState = useAppStore(
    (s) => s.stepThreeData?.mealBrainstormState || "not_started"
  );

  // ✅ 1. Create the scroll container ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (mealBrainstormState === "loading") return <LoadingScreen />;
  if (mealBrainstormState === "completed") return <MealResultsView />;

  return (
    <div className="flex flex-col h-full">
      {/* ✅ 2. Attach the ref here */}
      <div
        ref={scrollContainerRef}
        data-scroll-container
        className="flex-1 overflow-y-auto"
      >
        {/* ✅ 3. Pass it down */}
        <QuestionnaireView containerRef={scrollContainerRef} />
      </div>
    </div>
  );
}
