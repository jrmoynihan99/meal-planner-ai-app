// /app/(plan-layout)/your-plan/ViewModeContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

type ViewModeContextType = {
  isVerticalView: boolean;
  toggleVerticalView: () => void;
};

const ViewModeContext = createContext<ViewModeContextType | undefined>(
  undefined
);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [isVerticalView, setIsVerticalView] = useState(false);

  const value = {
    isVerticalView,
    toggleVerticalView: () => setIsVerticalView((v) => !v),
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context)
    throw new Error("useViewMode must be used within ViewModeProvider");
  return context;
}
