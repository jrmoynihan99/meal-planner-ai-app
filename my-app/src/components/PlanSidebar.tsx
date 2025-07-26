"use client";

import { useSidebar } from "@/components/SidebarContext";
import { useEffect } from "react";

export function PlanSidebar() {
  const { isOpen, close } = useSidebar();

  // Prevent background scrolling when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile overlay (click to close) */}
      <div
        onClick={close}
        className={`fixed inset-0 z-51 bg-black bg-opacity-50 transition-opacity duration-300 sm:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 z-52 h-full w-72 bg-zinc-900 border-r border-zinc-800 shadow-lg pt-16
          transition-transform duration-500 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          sm:static sm:translate-x-0 sm:shadow-none sm:border-r`}
      >
        <nav className="p-6 space-y-4">{/* Blank for now */}</nav>
      </aside>
    </>
  );
}
