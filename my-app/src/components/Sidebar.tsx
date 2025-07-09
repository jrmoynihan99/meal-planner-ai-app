"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { CheckCircle, Circle, Eye, ChevronDown } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { StepOneSummaryOverlay } from "@/components/StepOneSummaryOverlay";
import { StepTwoSummaryOverlay } from "@/components/StepTwoSummaryOverlay";
import { SubstepOneSummaryOverlay } from "@/components/SubstepOneSummaryOverlay";
import { SubstepTwoSummaryOverlay } from "@/components/SubstepTwoSummaryOverlay";
import { SubstepThreeSummaryOverlay } from "@/components/SubstepThreeSummaryOverlay";

const steps = [
  {
    key: "step1",
    label: "STEP 1",
    title: "Input Your Data",
    path: "/step-one-data",
  },
  {
    key: "step2",
    label: "STEP 2",
    title: "Choose Your Goal",
    path: "/step-two-goal",
  },
  {
    key: "step3",
    label: "STEP 3",
    title: "Build Your Plan",
    path: "/step-three-planner/meal-number",
    substeps: [
      {
        key: "mealNumber",
        title: "Pick Meal Number",
        path: "/step-three-planner/meal-number",
      },
      {
        key: "brainstorm",
        title: "Choose Meals",
        path: "/step-three-planner/meal-brainstorm",
      },
      {
        key: "day",
        title: "Approve Days",
        path: "/step-three-planner/create-days",
      },
      {
        key: "week",
        title: "Finalize Week",
        path: "/step-three-planner/weekly-assignment",
      },
    ],
  },
  {
    key: "step4",
    label: "STEP 4",
    title: "Results",
    path: "/step-four-results",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const [activeEditStep, setActiveEditStep] = useState<string | null>(null);
  const [isStep3Expanded, setIsStep3Expanded] = useState(true);

  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const isStepOneComplete = useAppStore((s) =>
    hasHydrated ? s.isStepOneComplete() : false
  );
  const isStepTwoComplete = useAppStore((s) =>
    hasHydrated ? s.isStepTwoComplete() : false
  );
  const stepThreeData = useAppStore((s) => s.stepThreeData);

  // Define per-substep completion logic
  const substepCompletion: Record<string, boolean> = {
    mealNumber:
      !!stepThreeData?.mealsPerDay && !!stepThreeData?.uniqueWeeklyMeals,
    brainstorm:
      Array.isArray(stepThreeData?.approvedMeals) &&
      stepThreeData?.uniqueWeeklyMeals > 0 &&
      stepThreeData.approvedMeals.length === stepThreeData.uniqueWeeklyMeals,

    day:
      Array.isArray(stepThreeData?.approvedDays) &&
      stepThreeData.approvedDays.length > 0,
    week: stepThreeData?.weeklySchedule
      ? Object.values(stepThreeData.weeklySchedule).every((id) => id !== null)
      : false,
  };

  const isStepThreeComplete = Object.values(substepCompletion).every(Boolean);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  const stepCompletion = {
    step1: isStepOneComplete,
    step2: isStepTwoComplete,
    step3: isStepThreeComplete,
    step4: false,
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 z-51 bg-black bg-opacity-50 transition-opacity duration-300 sm:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-52 h-full w-72 bg-zinc-900 border-r border-zinc-800 shadow-lg transform transition-transform duration-500 ease-in-out pt-16
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        sm:static sm:translate-x-0 sm:shadow-none sm:border-r`}
      >
        <nav className="p-6 space-y-4">
          {steps.map((step) => {
            const isComplete =
              stepCompletion[step.key as keyof typeof stepCompletion];
            const hasSubsteps = !!step.substeps;
            const isAnySubstepActive = step.substeps?.some(
              (s) => pathname === s.path
            );
            const isStepActive =
              pathname === step.path || (hasSubsteps && isAnySubstepActive);

            return (
              <div
                key={step.key}
                className="border border-zinc-700 rounded-xl overflow-hidden"
              >
                {/* Step row */}
                <div
                  className={`flex items-center justify-between px-4 py-3 transition group cursor-pointer ${
                    isStepActive && !hasSubsteps
                      ? "bg-zinc-700 text-white"
                      : "text-gray-300 hover:bg-zinc-800"
                  }`}
                  onClick={() => {
                    if (hasSubsteps) {
                      setIsStep3Expanded((prev) => !prev);
                    } else {
                      window.location.href = step.path;
                      close();
                    }
                  }}
                >
                  <div className="flex flex-col flex-grow">
                    <span className="text-xs font-mono text-gray-400 tracking-wide">
                      {step.label}
                    </span>
                    <span className="text-sm font-semibold">{step.title}</span>
                    <div className="flex items-center gap-1 text-xs mt-0.5">
                      {isComplete ? (
                        <CheckCircle className="text-blue-500 w-4 h-4" />
                      ) : (
                        <Circle className="text-gray-500 w-4 h-4" />
                      )}
                      <span
                        className={`${
                          isComplete ? "text-blue-400" : "text-gray-500"
                        }`}
                      >
                        {isComplete ? "Complete" : "Not Complete"}
                      </span>
                    </div>
                  </div>

                  {hasSubsteps ? (
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isStep3Expanded ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEditStep(step.key);
                      }}
                      className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                      aria-label={`Edit ${step.title}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Substeps */}
                {hasSubsteps && isStep3Expanded && (
                  <div className="pl-6 pr-3 pb-2 space-y-2">
                    {step.substeps.map((sub, index) => {
                      const isSubActive = pathname === sub.path;
                      const isSubComplete = substepCompletion[sub.key] || false;

                      return (
                        <div
                          key={sub.key}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
                            isSubActive
                              ? "bg-zinc-700 text-white"
                              : "text-gray-300 hover:bg-zinc-800"
                          }`}
                          onClick={() => {
                            window.location.href = sub.path;
                            close();
                          }}
                        >
                          <div className="flex flex-col flex-grow">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                <span className="text-gray-400 font-mono mr-1">
                                  {index + 1}.
                                </span>
                                {sub.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs mt-1">
                              {isSubComplete ? (
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-500" />
                              )}
                              <span
                                className={`tracking-wide ${
                                  isSubComplete
                                    ? "text-blue-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {isSubComplete ? "Complete" : "Not Complete"}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveEditStep(sub.key);
                            }}
                            className="p-1 text-zinc-400 hover:text-white transition cursor-pointer mt-1 ml-2"
                            aria-label={`Edit ${sub.title}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Edit Step Overlays */}
      <AnimatePresence>
        {activeEditStep === "step1" && (
          <StepOneSummaryOverlay onClose={() => setActiveEditStep(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeEditStep === "step2" && (
          <StepTwoSummaryOverlay onClose={() => setActiveEditStep(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeEditStep === "mealNumber" && (
          <SubstepOneSummaryOverlay onClose={() => setActiveEditStep(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeEditStep === "brainstorm" && (
          <SubstepTwoSummaryOverlay onClose={() => setActiveEditStep(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeEditStep === "day" && (
          <SubstepThreeSummaryOverlay onClose={() => setActiveEditStep(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
