"use client";

import { SidebarProvider } from "@/components/SidebarContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MenuButton } from "@/components/MenuButton";
import { useSidebar } from "@/components/SidebarContext";
import { motion } from "framer-motion";

export default function StepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-black text-white">
      <Sidebar />

      {/* Sticky MenuButton that sits above sidebar and content on mobile */}
      <div className="fixed top-4 left-4 z-60 sm:hidden">
        <MenuButton />
      </div>

      {/* Animated main content */}
      <motion.div
        className="flex flex-col flex-1 min-w-0 max-w-full"
        animate={{
          x: isOpen ? 240 : 0, // Sidebar width
          scale: isOpen ? 0.95 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ originX: 0 }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </motion.div>
    </div>
  );
}
