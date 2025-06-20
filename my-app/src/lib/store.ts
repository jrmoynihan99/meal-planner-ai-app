// lib/store.ts
import { create } from "zustand";

export type Phase =
  | "ingredients"
  | "meal_approval"
  | "macro_targets"
  | "day_generation"
  | "week_structure"
  | "final_output";

type StepKey = "step1" | "step2" | "step3";

interface AppState {
  // Planner Phase Logic (Step 2)
  currentPhase: Phase;
  setPhase: (phase: Phase) => void;

  // Old optional way of tracking step progress
  completedSteps: Set<string>;
  markStepComplete: (step: string) => void;

  // New Sidebar Step Completion State
  stepCompletion: Record<StepKey, boolean>;
  markStepAsComplete: (key: StepKey) => void;

  // Placeholder for future UI trigger
  openEditStep: (key: StepKey) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPhase: "ingredients",
  setPhase: (phase) => set({ currentPhase: phase }),

  // Legacy or flexible step tracking (optional)
  completedSteps: new Set(),
  markStepComplete: (step) =>
    set((state) => ({
      completedSteps: new Set(state.completedSteps).add(step),
    })),

  // Sidebar Step Completion
  stepCompletion: {
    step1: false,
    step2: false,
    step3: false,
  },
  markStepAsComplete: (key) =>
    set((state) => ({
      stepCompletion: {
        ...state.stepCompletion,
        [key]: true,
      },
    })),

  openEditStep: (key) => {
    console.log(`Opening edit component for ${key}`);
    // This will be replaced by real UI logic
  },
}));
