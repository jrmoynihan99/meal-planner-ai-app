"use client";

import { useSidebar } from "@/components/SidebarContext";
import { useEffect } from "react";
import {
  Repeat,
  PlusCircle,
  Shuffle,
  ShoppingCart,
  UtensilsCrossed,
  BarChart2,
} from "lucide-react";
import Link from "next/link";

function SidebarButton({
  children,
  icon: Icon,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-md hover:bg-zinc-800 text-sm text-zinc-200 transition cursor-pointer"
    >
      <Icon className="w-4 h-4 text-zinc-400" />
      {children}
    </button>
  );
}

export function PlanSidebar({
  openMealsOverlay,
}: {
  openMealsOverlay: (mode: "browse" | "swap") => void;
}) {
  const { isOpen, close } = useSidebar();

  // Placeholder overlay openers for other actions
  const openSwapDayOverlay = () =>
    alert("Swap Day Overlay (not implemented yet)");
  const openSwapMealOverlay = () =>
    alert("Swap Meal Overlay (not implemented yet)");
  const openGroceryListOverlay = () =>
    alert("Grocery List (not implemented yet)");
  const openGoalSummaryOverlay = () =>
    alert("Goal Summary (not implemented yet)");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-51 bg-black bg-opacity-50 transition-opacity duration-300 sm:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 z-52 h-full w-54 bg-zinc-900 border-r border-zinc-800 shadow-lg
          transition-transform duration-500 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          sm:static sm:translate-x-0 sm:shadow-none sm:border-r`}
      >
        <div className="flex justify-center items-center py-4">
          <img
            src="/logo.png"
            alt="Dialed Logo"
            className="h-8 object-contain"
          />
        </div>
        <nav className="p-6 space-y-6">
          {/* Customize Section */}
          <div>
            <h2 className="text-sm font-semibold uppercase text-zinc-400 tracking-wider mb-2">
              Customize
            </h2>
            <SidebarButton icon={Shuffle} onClick={openSwapDayOverlay}>
              Edit Plan
            </SidebarButton>
            <SidebarButton icon={Repeat} onClick={openSwapMealOverlay}>
              Replace a Meal
            </SidebarButton>
          </div>

          {/* View Section */}
          <div>
            <h2 className="text-sm font-semibold uppercase text-zinc-400 tracking-wider mt-6 mb-2">
              View
            </h2>
            <SidebarButton icon={ShoppingCart} onClick={openGroceryListOverlay}>
              Grocery List
            </SidebarButton>
            <SidebarButton
              icon={UtensilsCrossed}
              onClick={() => openMealsOverlay("browse")}
            >
              My Meals
            </SidebarButton>
            <SidebarButton icon={BarChart2} onClick={openGoalSummaryOverlay}>
              My Goal & Data
            </SidebarButton>
          </div>
        </nav>
        <Link
          href="/your-plan"
          className="block mx-6 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-center py-3 text-sm font-semibold transition"
        >
          Your Plan
        </Link>
      </aside>
    </>
  );
}
