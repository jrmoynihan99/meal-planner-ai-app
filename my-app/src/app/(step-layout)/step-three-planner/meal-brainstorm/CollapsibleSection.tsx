"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import FoodToggleGrid from "./FoodToggleGrid";
import { StepThreePlannerData } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";

interface CollapsibleSectionProps {
  index: number;
  total: number;
  title: string;
  field: keyof StepThreePlannerData["ingredientPreferences"];
  options: string[];
  values: string[];
  onUpdate: (
    field: keyof StepThreePlannerData["ingredientPreferences"],
    values: string[]
  ) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  setOpenSectionIndex: (i: number) => void;
}

export default function CollapsibleSection({
  index,
  total,
  title,
  field,
  options,
  values,
  onUpdate,
  containerRef,
  isOpen,
  setOpenSectionIndex,
}: CollapsibleSectionProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [justCleared, setJustCleared] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNext = () => {
    const nextIndex = index + 1;
    if (nextIndex >= total) {
      setOpenSectionIndex(nextIndex);
      return;
    }
    setOpenSectionIndex(nextIndex);

    setTimeout(() => {
      const fallbackScrollParent = document.querySelector(
        "[data-scroll-container]"
      );
      const scrollParent = containerRef.current || fallbackScrollParent;
      const nextEl = document.getElementById(`section-${nextIndex}`);

      if (scrollParent && nextEl) {
        scrollParent.scrollTo({
          top: nextEl.offsetTop - 440,
          behavior: "smooth",
        });
      }
    }, 50);
  };

  const handleClear = () => {
    onUpdate(field, []);
    setJustCleared(true);
    setTimeout(() => setJustCleared(false), 1000);
  };

  return (
    <div
      id={`section-${index}`}
      className="w-full sm:mb-14 mb-6 sm:bg-transparent sm:rounded-none bg-zinc-900 rounded-2xl p-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center w-full px-1 sm:px-2 py-2">
        {/* Clickable toggle area */}
        <button
          type="button"
          onClick={() => setOpenSectionIndex(isOpen ? -1 : index)}
          className="flex items-center gap-5 sm:gap-4 flex-1 text-left"
          role="button"
          aria-expanded={isOpen}
        >
          {/* Number */}
          <div className="text-blue-500 font-bold text-4xl sm:text-5xl leading-none">
            {index + 1}
          </div>

          {/* Title + Chevron */}
          <div className="flex flex-col">
            <h2 className="text-white font-[var(--font-inter)] font-semibold text-base sm:text-xl">
              {title}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Select all that apply. Leave blank to let us decide.
            </p>
          </div>

          {isMobile && (
            <div className="text-white">
              {isOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          )}
        </button>

        {/* Desktop-only Clear All */}
        {!isMobile && (
          <button
            onClick={() => {
              onUpdate(field, []);
              setJustCleared(true);
              setTimeout(() => setJustCleared(false), 1000);
            }}
            className="hidden sm:inline-block text-sm font-semibold px-5 py-2 border border-red-500 text-red-500 rounded-lg bg-black hover:bg-red-600/30 transition duration-150 min-w-[100px] text-center cursor-pointer"
          >
            {justCleared ? "Cleared" : "Clear All"}
          </button>
        )}
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {(isMobile ? isOpen : true) && (
          <motion.div
            key="collapsible-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-2"
          >
            <FoodToggleGrid
              options={options}
              selected={values}
              onChange={(newVals: string[]) => onUpdate(field, newVals)}
            />

            {isMobile && (
              <div className="mt-3 flex gap-3">
                <button
                  onClick={handleClear}
                  className="w-1/2 bg-black border border-red-500 text-red-500 text-sm font-medium py-3 rounded-xl hover:bg-red-900/10 transition"
                >
                  <motion.span
                    key={justCleared ? "cleared" : "clear"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {justCleared ? "Cleared" : "Clear All"}
                  </motion.span>
                </button>

                <button
                  onClick={handleNext}
                  className="w-1/2 bg-blue-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-blue-700 transition"
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
