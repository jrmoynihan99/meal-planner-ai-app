// app/your-plan/layout.tsx

"use client";

import { SidebarProvider } from "@/components/SidebarContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MenuButton } from "@/components/MenuButton";
import { useSidebar } from "@/components/SidebarContext";
import { motion } from "framer-motion";
import { GroceryCartProvider } from "./your-plan/GroceryCartContext";
import { ViewModeProvider } from "./your-plan/ViewModeContext"; // ✅ NEW

export default function YourPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <GroceryCartProvider>
        <ViewModeProvider>
          <LayoutContent>{children}</LayoutContent>
        </ViewModeProvider>
      </GroceryCartProvider>
    </SidebarProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-black text-white">
      {/* Sidebar — placeholder for now */}
      <Sidebar />

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
        <Header />
        <main className="flex-1 h-full overflow-hidden">{children}</main>
      </motion.div>
    </div>
  );
}
