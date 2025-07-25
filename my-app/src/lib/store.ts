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
  ingredients: MealIngredient[];
  recipe: string[];
  bestFor?: "breakfast" | "lunch" | "dinner" | "versatile";
  imageUrl?: string;
}

export interface MealIngredient {
  name: string;
  amount: string; // For user-friendly display (e.g., "1 tbsp")
  grams?: number; // Required for portion scaling (used in solver)
  mainProtein?: 0 | 1; // 1 = scalable, 0 = fixed
  grams_per_unit?: number;
  protein_per_gram?: number; // Optional precomputed macros
  calories_per_gram?: number;
  recommended_unit?: string;
  calories?: number;
  protein?: number;
}

export interface DayPlan {
  id: string;
  planNumber: number;
  meals: {
    mealId: string;
    mealName: string;
    mealDescription: string;
    ingredients: {
      name: string;
      grams: number;
      protein: number;
      calories: number;
      amount: string;
    }[];
    totalProtein: number;
    totalCalories: number;
    recipe: string[];
    bestFor?: "breakfast" | "lunch" | "dinner" | "versatile";
    imageUrl?: string;
  }[];
  dayProtein: number;
  dayCalories: number;
}

export interface StepThreePlannerData {
  mealsPerDay: number;
  uniqueWeeklyMeals: number;
  approvedMeals: Meal[];
  savedMeals: Meal[];
  generatedMeals: Meal[];
  allPlanOneDays: DayPlan[];
  allPlanTwoDays: DayPlan[];
  allPlanThreeDays: DayPlan[];
  approvedDays: DayPlan[];
  unapprovedDays: DayPlan[]; // ← renamed from allGeneratedDays
  mealBrainstormState: "not_started" | "loading" | "completed" | "editing";
  ingredientPreferences: {
    proteins: string[];
    carbs: string[];
    veggies: string[];
    likesFruit: boolean;
    cuisines: string[];
    customInput: string;
    customFoods: {
      proteins: string[];
      carbs: string[];
      veggies: string[];
      cuisines: string[];
    };
  };
  dayGenerationState: "not_started" | "started" | "completed";
  weeklySchedule: Record<DayOfWeek, DayPlan | null>;
  weeklyScheduleTwo: Record<DayOfWeek, DayPlan | null>;
  weeklyScheduleThree: Record<DayOfWeek, DayPlan | null>;
  skippedDays: DayOfWeek[];
  mealTimes: Record<string, string>;
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

  hiddenOverlays: Record<string, boolean>;
  setOverlayHidden: (key: string, hidden: boolean) => void;

  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;

  setMealBrainstormState: (
    state: "not_started" | "loading" | "completed" | "editing"
  ) => void;
  setIngredientPreferences: (
    prefs: StepThreePlannerData["ingredientPreferences"]
  ) => void;
  addCustomFoodItem: (
    field: keyof StepThreePlannerData["ingredientPreferences"]["customFoods"],
    item: string
  ) => void;

  setGeneratedMeals: (meals: Meal[]) => void;
  setApprovedMeals: (meals: Meal[]) => void;
  setSavedMeals: (meals: Meal[]) => void;
}

const defaultStepThreeData: StepThreePlannerData = {
  mealsPerDay: 0,
  uniqueWeeklyMeals: 0,
  approvedMeals: [],
  savedMeals: [],
  generatedMeals: [],
  allPlanOneDays: [],
  allPlanTwoDays: [],
  allPlanThreeDays: [],
  approvedDays: [],
  unapprovedDays: [],
  mealBrainstormState: "not_started",
  ingredientPreferences: {
    proteins: [],
    carbs: [],
    veggies: [],
    likesFruit: true,
    cuisines: [],
    customInput: "",
    customFoods: {
      proteins: [],
      carbs: [],
      veggies: [],
      cuisines: [],
    },
  },
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
  weeklyScheduleTwo: {
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null,
  },
  weeklyScheduleThree: {
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null,
  },
  skippedDays: [],
  mealTimes: {}, // ← Add this missing property
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

      stepThreeData: defaultStepThreeData,
      setStepThreeData: (partialData) => {
        const prev = get().stepThreeData || defaultStepThreeData;
        set({
          stepThreeData: {
            ...prev,
            ...partialData,
          },
        });
      },

      hiddenOverlays: {},
      setOverlayHidden: (key, hidden) =>
        set((state) => {
          const newHiddenOverlays = { ...state.hiddenOverlays };
          if (hidden) {
            newHiddenOverlays[key] = true;
          } else {
            delete newHiddenOverlays[key];
          }
          return { hiddenOverlays: newHiddenOverlays };
        }),

      setMealBrainstormState: (
        state: "not_started" | "loading" | "completed" | "editing"
      ) =>
        set((s) => ({
          stepThreeData: {
            ...s.stepThreeData!,
            mealBrainstormState: state,
          },
        })),

      setIngredientPreferences: (
        prefs: StepThreePlannerData["ingredientPreferences"]
      ) =>
        set((s) => ({
          stepThreeData: {
            ...s.stepThreeData!,
            ingredientPreferences: prefs,
          },
        })),

      addCustomFoodItem: (field, item) =>
        set((s) => {
          const prev = s.stepThreeData!;
          const currentCustoms =
            prev.ingredientPreferences.customFoods[field] || [];

          const updatedList = Array.from(new Set([...currentCustoms, item])); // remove dupes

          return {
            stepThreeData: {
              ...prev,
              ingredientPreferences: {
                ...prev.ingredientPreferences,
                customFoods: {
                  ...prev.ingredientPreferences.customFoods,
                  [field]: updatedList,
                },
              },
            },
          };
        }),

      setApprovedMeals: (meals: Meal[]) =>
        set((s) => ({
          stepThreeData: {
            ...s.stepThreeData!,
            approvedMeals: meals,
          },
        })),

      setSavedMeals: (meals: Meal[]) =>
        set((s) => ({
          stepThreeData: {
            ...s.stepThreeData!,
            savedMeals: meals,
          },
        })),

      setGeneratedMeals: (meals: Meal[]) =>
        set((s) => ({
          stepThreeData: {
            ...s.stepThreeData!,
            generatedMeals: meals,
          },
        })),

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
          Array.isArray(data.approvedDays) &&
          data.approvedDays.length > 0 &&
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
