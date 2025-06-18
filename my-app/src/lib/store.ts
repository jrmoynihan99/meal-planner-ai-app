// lib/store.ts
import { create } from "zustand";

export type Phase =
  | "ingredients"
  | "meal_approval"
  | "macro_targets"
  | "day_generation"
  | "week_structure"
  | "final_output";

interface AppState {
  currentPhase: Phase;
  setPhase: (phase: Phase) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPhase: "ingredients",
  setPhase: (phase) => set({ currentPhase: phase }),
}));
