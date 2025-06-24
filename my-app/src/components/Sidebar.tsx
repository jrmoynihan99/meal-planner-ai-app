"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { CheckCircle, Circle, Eye } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { StepOneSummaryOverlay } from "@/components/StepOneSummaryOverlay";
import { StepTwoSummaryOverlay } from "@/components/StepTwoSummaryOverlay";

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
    title: "Pick Your Goal",
    path: "/step-two-goal",
  },
  {
    key: "step3",
    label: "STEP 3",
    title: "Make Your Meals",
    path: "/step-three-planner",
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

  // Zustand step data
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const isStepOneComplete = useAppStore((s) =>
    hasHydrated ? s.isStepOneComplete() : false
  );
  const isStepTwoComplete = useAppStore((s) =>
    hasHydrated ? s.isStepTwoComplete() : false
  );
  const isStepThreeComplete = useAppStore((s) =>
    hasHydrated ? s.isStepThreeComplete() : false
  );

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  // Step completion logic (based on presence of data)
  const stepCompletion = {
    step1: isStepOneComplete,
    step2: isStepTwoComplete,
    step3: isStepThreeComplete,
    step4: false, // You can add logic later
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
        className={`fixed top-0 left-0 z-52 h-full w-64 bg-zinc-900 border-r border-zinc-800 shadow-lg transform transition-transform duration-500 ease-in-out pt-16
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        sm:static sm:translate-x-0 sm:shadow-none sm:border-r`}
      >
        <nav className="p-6 space-y-4">
          {steps.map((step) => {
            const isActive = pathname === step.path;
            const isComplete =
              stepCompletion[step.key as keyof typeof stepCompletion];

            return (
              <div
                key={step.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition group cursor-pointer ${
                  isActive
                    ? "bg-zinc-700 text-white"
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
    </>
  );
}
