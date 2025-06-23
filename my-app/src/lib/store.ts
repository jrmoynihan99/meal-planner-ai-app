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
  maintanenceCalories: number;
}

export interface StepTwoData {
  selectedGoalTitle: string;
  goalCalories: number;
  goalProtein: number;
  calorieDelta: number; // e.g. -800 or +500
  calorieDeltaText: string; // e.g. "maintenance - 800"
}

interface AppState {
  // Planner Phase Logic (Step 2)
  currentPhase: Phase;
  setPhase: (phase: Phase) => void;

  // Optional legacy step tracking (can be removed if unused)
  completedSteps: Set<string>;
  markStepComplete: (step: string) => void;

  // UI placeholder
  openEditStep: (key: string) => void;

  // Step 1: user data + calculated maintenance
  stepOneData: StepOneData | null;
  setStepOneData: (data: StepOneData | null) => void;

  // Step 2: user-selected goal + targets
  stepTwoData: StepTwoData | null;
  setStepTwoData: (data: StepTwoData | null) => void;

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

      openEditStep: (key) => {
        console.log(`Opening edit component for ${key}`);
      },

      stepOneData: null,
      setStepOneData: (data) => set({ stepOneData: data }),

      stepTwoData: null,
      setStepTwoData: (data) => set({ stepTwoData: data }),

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
