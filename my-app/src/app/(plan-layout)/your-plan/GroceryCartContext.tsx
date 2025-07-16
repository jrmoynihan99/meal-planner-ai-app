"use client";

import { createContext, useContext, useState } from "react";

type GroceryCartContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const GroceryCartContext = createContext<GroceryCartContextType | undefined>(
  undefined
);

export function GroceryCartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const value: GroceryCartContextType = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };

  return (
    <GroceryCartContext.Provider value={value}>
      {children}
    </GroceryCartContext.Provider>
  );
}

export function useGroceryCart() {
  const context = useContext(GroceryCartContext);
  if (!context)
    throw new Error("useGroceryCart must be used within GroceryCartProvider");
  return context;
}
