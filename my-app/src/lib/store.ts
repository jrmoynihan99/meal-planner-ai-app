// lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Phase =
  | "intro"
  | "ingredients"
  | "meal_number"
  | "meal_generation"
  | "meals_per_day"
  | "plan_generation"
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

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface Meal {
  id: string;
  name: string;
  description: string;
  ingredients: {
    name: string;
    amount: string;
    protein?: number;
    calories?: number;
  }[];
  recipe: string;
}

export interface DayPlan {
  id: string;
  meals: {
    mealId: string;
    ingredients: {
      name: string;
      amount: string;
      protein: number;
      calories: number;
    }[];
    totalProtein: number;
    totalCalories: number;
  }[];
  dayProtein: number;
  dayCalories: number;
}

export interface StepThreePlannerData {
  mealsPerDay: number;
  uniqueWeeklyMeals: number;
  approvedMeals: Meal[];
  days: DayPlan[];
  dayGenerationState: "not_started" | "started" | "completed";
  weeklySchedule: Record<DayOfWeek, string | null>;
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
  mealsPerDay: 0,
  uniqueWeeklyMeals: 0,
  approvedMeals: [],
  days: [],
  dayGenerationState: "not_started",
  weeklySchedule: {
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null,
  },
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

      resetStepOneData: () => set({ stepOneData: null }),
      resetStepTwoData: () => set({ stepTwoData: null }),
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
          data.mealsPerDay > 0 &&
          data.uniqueWeeklyMeals > 0 &&
          Array.isArray(data.approvedMeals) &&
          data.approvedMeals.length > 0 &&
          Array.isArray(data.days) &&
          data.days.length > 0 &&
          data.dayGenerationState === "completed" &&
          data.weeklySchedule &&
          Object.values(data.weeklySchedule).every((id) => id !== null)
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
