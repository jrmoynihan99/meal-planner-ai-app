"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { CheckCircle, Circle, Eye } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { StepOneSummaryOverlay } from "@/components/StepOneSummaryOverlay";
import { StepTwoSummaryOverlay } from "@/components/StepTwoSummaryOverlay";
import { SubstepTwoSummaryOverlay } from "@/components/SubstepTwoSummaryOverlay";

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
    path: "/step-three-planner/meal-brainstorm",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const [activeEditStep, setActiveEditStep] = useState<string | null>(null);

  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const isStepOneComplete = useAppStore((s) =>
    hasHydrated ? s.isStepOneComplete() : false
  );
  const isStepTwoComplete = useAppStore((s) =>
    hasHydrated ? s.isStepTwoComplete() : false
  );
  const stepThreeData = useAppStore((s) => s.stepThreeData);

  // Define step 3 completion logic (you can adjust this based on your needs)
  const isStepThreeComplete =
    Array.isArray(stepThreeData?.approvedMeals) &&
    stepThreeData?.approvedMeals.length >= 5;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  const stepCompletion = {
    step1: isStepOneComplete,
    step2: isStepTwoComplete,
    step3: isStepThreeComplete,
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
            const isStepActive = pathname === step.path;

            return (
              <div
                key={step.key}
                className="border border-zinc-700 rounded-xl overflow-hidden"
              >
                {/* Step row */}
                <div
                  className={`flex items-center justify-between px-4 py-3 transition group cursor-pointer ${
                    isStepActive
                      ? "bg-zinc-800 text-white"
                      : "text-gray-300 hover:bg-zinc-800"
                  }`}
                  onClick={() => {
                    window.location.href = step.path;
                    close();
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
                </div>
              </div>
            );
          })}

          {/* Final Plan Button */}
          <div className="pt-2">
            <button
              disabled={
                !stepCompletion.step1 ||
                !stepCompletion.step2 ||
                !stepCompletion.step3
              }
              onClick={() => {
                if (
                  stepCompletion.step1 &&
                  stepCompletion.step2 &&
                  stepCompletion.step3
                ) {
                  window.location.href = "/your-plan";
                  close();
                }
              }}
              className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all shadow-md
                ${
                  stepCompletion.step1 &&
                  stepCompletion.step2 &&
                  stepCompletion.step3
                    ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                }
              `}
            >
              Your Plan
            </button>
          </div>
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
        {activeEditStep === "step3" && (
          <SubstepTwoSummaryOverlay onClose={() => setActiveEditStep(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
