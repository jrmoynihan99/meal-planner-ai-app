"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FruitToggleProps {
  value: boolean;
  onChange: (val: boolean) => void;
}

export default function FruitToggle({ value, onChange }: FruitToggleProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`w-full ${isMobile ? "bg-zinc-900 rounded-2xl p-4 mb-6" : ""}`}
    >
      <div className="flex items-center gap-4 w-full px-1 sm:px-2 py-2">
        {/* Number */}
        <div className="text-blue-500 font-bold text-4xl sm:text-5xl leading-none">
          5
        </div>

        {/* Label and toggle */}
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h2 className="text-white font-[var(--font-inter)] font-semibold text-base sm:text-xl">
              Do You Like Fruit?
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              This helps us tailor your meal plan.
            </p>
          </div>

          <div className="relative w-32 h-10 bg-zinc-800 rounded-full flex border border-zinc-600 overflow-hidden ml-4 shrink-0">
            {/* Sliding background */}
            <motion.div
              className="absolute top-0 h-full w-1/2 rounded-full bg-blue-600 z-0"
              animate={{ left: value ? "0%" : "50%" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />

            {/* Yes */}
            <button
              className={`w-1/2 font-mono z-10 rounded-full transition-colors duration-150 ${
                value ? "text-white" : "text-zinc-400"
              }`}
              onClick={() => onChange(true)}
            >
              Yes
            </button>

            {/* No */}
            <button
              className={`w-1/2 font-mono z-10 rounded-full transition-colors duration-150 ${
                !value ? "text-white" : "text-zinc-400"
              }`}
              onClick={() => onChange(false)}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
