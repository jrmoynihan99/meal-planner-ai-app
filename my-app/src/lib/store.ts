// lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Phase =
  | "intro"
  | "ingredients"
  | "ingredients_confirmation"
  | "meal_tweaking"
  | "meal_confirmation"
  | "meal_number"
  | "example_day"
  | "day_tweaking"
  | "day_number"
  | "weekly_assignment"
  | "conclusion";

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
  calorieDelta: number;
  calorieDeltaText: string;
}

export interface StepThreePlannerData {
  approvedIngredients: string[];
  numberOfMeals: number;
  meals: {
    name: string;
    description: string;
    ingredients: {
      name: string;
      amount: string;
    }[];
    recipe: string;
  }[];
  weeklySchedule: Record<string, string[]>;
}

interface AppState {
  currentPhase: Phase;
  setPhase: (phase: Phase) => void;

  completedSteps: Set<string>;
  markStepComplete: (step: string) => void;

  openEditStep: (key: string) => void;

  stepOneData: StepOneData | null;
  setStepOneData: (data: StepOneData | null) => void;

  stepTwoData: StepTwoData | null;
  setStepTwoData: (data: StepTwoData | null) => void;

  stepThreeData: StepThreePlannerData | null;
  setStepThreeData: (data: Partial<StepThreePlannerData>) => void;
  resetStepThreeData: () => void;

  resetStepOneData: () => void;
  resetStepTwoData: () => void;

  isStepOneComplete: () => boolean;
  isStepTwoComplete: () => boolean;
  isStepThreeComplete: () => boolean;

  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

const defaultStepThreeData: StepThreePlannerData = {
  approvedIngredients: [],
  numberOfMeals: 0,
  meals: [],
  weeklySchedule: {},
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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

      stepThreeData: null,
      setStepThreeData: (partialData) => {
        const prev = get().stepThreeData || defaultStepThreeData;
        set({
          stepThreeData: {
            ...prev,
            ...partialData,
          },
        });
      },

      resetStepOneData: () =>
        set({
          stepOneData: null,
        }),

      resetStepTwoData: () =>
        set({
          stepTwoData: null,
        }),

      resetStepThreeData: () =>
        set({
          stepThreeData: null,
          currentPhase: "intro",
        }),

      isStepOneComplete: () => {
        const data = get().stepOneData;
        return (
          !!data &&
          data.sex !== "" &&
          data.age > 0 &&
          data.heightFt > 0 &&
          data.heightIn >= 0 &&
          data.weight > 0 &&
          !!data.activity &&
          typeof data.maintanenceCalories === "number"
        );
      },

      isStepTwoComplete: () => {
        const data = get().stepTwoData;
        return (
          !!data &&
          !!data.selectedGoalTitle &&
          typeof data.goalCalories === "number" &&
          typeof data.goalProtein === "number"
        );
      },

      isStepThreeComplete: () => {
        const data = get().stepThreeData;
        return (
          !!data &&
          Array.isArray(data.approvedIngredients) &&
          data.approvedIngredients.length > 0 &&
          data.numberOfMeals > 0 &&
          Array.isArray(data.meals) &&
          data.meals.length === data.numberOfMeals &&
          Object.keys(data.weeklySchedule).length > 0
        );
      },

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
