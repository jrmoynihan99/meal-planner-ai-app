"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MealsPerDaySelectorProps {
  value: number;
  onChange: (val: number) => void;
}

const options = [1, 2, 3, 4];

export default function MealsPerDaySelector({
  value,
  onChange,
}: MealsPerDaySelectorProps) {
  const [, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full bg-zinc-900 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-4 w-full px-1 sm:px-2 py-2">
        {/* Number */}
        <div className="text-blue-500 font-bold text-4xl sm:text-5xl leading-none">
          1
        </div>

        {/* Label and toggle */}
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h2 className="text-white font-[var(--font-inter)] font-semibold text-base sm:text-xl">
              Meals Per Day
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              We’ll use this to structure your meal plan.
            </p>
          </div>

          {/* Toggle Group */}
          <div className="relative w-40 h-10 bg-zinc-800 rounded-full flex border border-zinc-600 overflow-hidden ml-4 shrink-0">
            {/* Sliding background */}
            <motion.div
              className="absolute top-0 h-full w-1/4 rounded-full bg-blue-600 z-0"
              animate={{ left: `${(value - 1) * 25}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />

            {options.map((opt) => (
              <button
                key={opt}
                className={`w-1/4 z-10 font-mono text-sm transition-colors duration-150 ${
                  value === opt ? "text-white" : "text-zinc-400"
                }`}
                onClick={() => onChange(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
