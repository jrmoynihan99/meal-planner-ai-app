"use client";

import { useEffect, useState } from "react";

interface CustomInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function CustomInput({ value, onChange }: CustomInputProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full bg-zinc-900 rounded-2xl p-4 mb-6">
      <div className="flex items-start gap-4 w-full px-1 sm:px-2 py-2">
        {/* Number icon */}
        <div className="text-blue-500 font-bold text-4xl sm:text-5xl leading-none pt-1">
          7
        </div>

        <div className="flex-1">
          <h2 className="text-white font-[var(--font-inter)] font-semibold text-base sm:text-xl">
            Anything Else We Should Know?
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            (Tell our AI anything... for power users)
          </p>

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full mt-3 border border-zinc-600 bg-zinc-800 text-white p-3 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share anything you'd like our AI to know"
          />
        </div>
      </div>
    </div>
  );
}
