"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface VarietySelectorProps {
  value: "none" | "some" | "lots";
  onChange: (val: "none" | "some" | "lots") => void;
}

const options: { label: string; value: "none" | "some" | "lots" }[] = [
  { label: "None", value: "none" },
  { label: "Some", value: "some" },
  { label: "Lots", value: "lots" },
];

export default function VarietySelector({
  value,
  onChange,
}: VarietySelectorProps) {
  const [, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectedIdx = options.findIndex((opt) => opt.value === value);
  const numOptions = options.length;
  const widthPercent = 100 / numOptions;
  const leftPercent = selectedIdx * widthPercent;

  return (
    <div className="w-full bg-zinc-900 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-4 w-full px-1 sm:px-2 py-2">
        {/* Icon or number (optional, remove if not needed) */}
        <div className="text-blue-500 font-bold text-4xl sm:text-5xl leading-none">
          2
        </div>

        {/* Label and toggle */}
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h2 className="text-white font-[var(--font-inter)] font-semibold text-base sm:text-xl">
              Variety
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Choose how much variety you want in your weekly plan.
            </p>
          </div>

          {/* Toggle Group */}
          <div className="relative w-52 h-10 bg-zinc-800 rounded-full flex border border-zinc-600 overflow-hidden ml-4 shrink-0">
            {/* Sliding background */}
            <motion.div
              className="absolute top-0 h-full rounded-full bg-blue-600 z-0"
              style={{
                width: `${widthPercent}%`,
              }}
              animate={{ left: `${leftPercent}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />

            {options.map((opt) => (
              <button
                key={opt.value}
                className={`z-10 font-mono text-sm flex-1 transition-colors duration-150 ${
                  value === opt.value ? "text-white" : "text-zinc-400"
                }`}
                onClick={() => onChange(opt.value)}
                style={{
                  width: `${widthPercent}%`,
                }}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
