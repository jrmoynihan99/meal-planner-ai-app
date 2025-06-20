// lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Phase =
  | "ingredients"
  | "meal_approval"
  | "macro_targets"
  | "day_generation"
  | "week_structure"
  | "final_output";

type StepKey = "step1" | "step2" | "step3";

export type Sex = "male" | "female" | "";

export interface ActivityLevel {
  label: string;
  description: string;
  multiplier: number;
}

export interface StepOneData {
  sex: Sex;
  age: number;
  heightFt: number;
  heightIn: number;
  weight: number;
  activity: ActivityLevel;
  calorieTarget: number;
  proteinTarget: number;
}

interface AppState {
  // Planner Phase Logic (Step 2)
  currentPhase: Phase;
  setPhase: (phase: Phase) => void;

  // Optional legacy step tracking
  completedSteps: Set<string>;
  markStepComplete: (step: string) => void;

  // Sidebar progress state
  stepCompletion: Record<StepKey, boolean>;
  markStepAsComplete: (key: StepKey) => void;

  // UI placeholder
  openEditStep: (key: StepKey) => void;

  // Step 1: user data + calculated targets
  stepOneData: StepOneData | null;
  setStepOneData: (data: StepOneData) => void;

  // Hydration flag
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentPhase: "ingredients",
      setPhase: (phase) => set({ currentPhase: phase }),

      completedSteps: new Set(),
      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: new Set(state.completedSteps).add(step),
        })),

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
      },

      stepOneData: null,
      setStepOneData: (data) => set({ stepOneData: data }),

      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: "app-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
