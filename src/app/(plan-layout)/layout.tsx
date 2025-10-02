// app/your-plan/layout.tsx
"use client";

import { SidebarProvider } from "@/components/SidebarContext";
import { PlanSidebar } from "@/components/PlanSidebar";
import { PlanHeader } from "@/components/PlanHeader";
import { MenuButton } from "@/components/MenuButton";
import { useSidebar } from "@/components/SidebarContext";
import { motion } from "framer-motion";
import { GroceryCartProvider } from "./your-plan/GroceryCartContext";
import { ViewModeProvider } from "./your-plan/ViewModeContext";
import { useState } from "react";
import { MealsOverlay } from "@/components/MealsOverlay"; // <-- Import overlay

export default function YourPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Overlay state here:
  const [mealsOverlayOpen, setMealsOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<"browse" | "swap">("browse");
  // Add more state if you want to support "swap" context

  function openMealsOverlay(mode: "browse" | "swap") {
    setOverlayMode(mode);
    setMealsOverlayOpen(true);
  }

  function closeMealsOverlay() {
    setMealsOverlayOpen(false);
    // Optionally reset overlayMode/context here
  }

  return (
    <SidebarProvider>
      <GroceryCartProvider>
        <ViewModeProvider>
          <LayoutContent
            openMealsOverlay={openMealsOverlay}
            closeMealsOverlay={closeMealsOverlay}
            mealsOverlayOpen={mealsOverlayOpen}
            overlayMode={overlayMode}
          >
            {children}
          </LayoutContent>
        </ViewModeProvider>
      </GroceryCartProvider>
    </SidebarProvider>
  );
}

// Pass overlay control as props down to LayoutContent and children
function LayoutContent({
  children,
  openMealsOverlay,
  closeMealsOverlay,
  mealsOverlayOpen,
  overlayMode,
}: {
  children: React.ReactNode;
  openMealsOverlay: (mode: "browse" | "swap") => void;
  closeMealsOverlay: () => void;
  mealsOverlayOpen: boolean;
  overlayMode: "browse" | "swap";
}) {
  const { isOpen } = useSidebar();

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-black text-white">
      {/* Plan Sidebar */}
      <PlanSidebar openMealsOverlay={openMealsOverlay} />

      {/* Sticky MenuButton */}
      <div className="fixed top-4 left-4 z-60 sm:hidden">
        <MenuButton />
      </div>

      {/* Animated Main Content Area */}
      <motion.div
        className="flex flex-col flex-1 min-w-0 max-w-full"
        animate={{
          x: isOpen ? 240 : 0,
          scale: isOpen ? 0.95 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ originX: 0 }}
      >
        <PlanHeader />
        <main className="flex-1 h-full overflow-hidden">{children}</main>
      </motion.div>

      {/* Meals Overlay */}
      <MealsOverlay
        isOpen={mealsOverlayOpen}
        mode={overlayMode}
        onClose={closeMealsOverlay}
      />
    </div>
  );
}
