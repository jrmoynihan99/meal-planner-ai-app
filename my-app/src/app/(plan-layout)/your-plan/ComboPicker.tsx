"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ComboPickerProps {
  currentIdx: number; // 0-based
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export function ComboPicker({
  currentIdx,
  total,
  onPrev,
  onNext,
}: ComboPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrev}
        className="w-9 h-9 cursor-pointer rounded-full flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={total <= 1}
        aria-label="Previous combo"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {/* Label and Counter */}
      <div className="flex flex-col items-center justify-center min-w-[42px]">
        <span className="text-[11px] text-zinc-400 font-medium mb-[1px] tracking-wide uppercase">
          Options
        </span>
        <span className="text-xs font-mono text-zinc-300 text-center select-none">
          {total > 0 ? `${currentIdx + 1} / ${total}` : "–"}
        </span>
      </div>
      <button
        onClick={onNext}
        className="w-9 h-9 cursor-pointer rounded-full flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={total <= 1}
        aria-label="Next combo"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
