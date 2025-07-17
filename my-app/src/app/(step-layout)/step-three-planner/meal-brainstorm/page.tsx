"use client";

import { useAppStore } from "@/lib/store";
import QuestionnaireView from "./QuestionnaireView";
import LoadingScreen from "./LoadingScreen";
import MealResultsView from "./MealResultsView";

export default function MealBrainstormPage() {
  const mealBrainstormState = useAppStore(
    (s) => s.stepThreeData?.mealBrainstormState || "not_started"
  );

  if (mealBrainstormState === "loading") return <LoadingScreen />;
  if (mealBrainstormState === "completed") return <MealResultsView />;

  return (
    <div className="flex flex-col h-full">
      <QuestionnaireView />
    </div>
  );
}
