"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import clsx from "clsx";

interface GlowingButtonTwoProps {
  onClick: () => void;
  text: string;
  loading?: boolean;
  fullWidth?: boolean;
  animatedBorder?: boolean;
  className?: string; // ← ADD THIS
}

export function GlowingButtonTwo({
  onClick,
  text,
  loading = false,
  fullWidth = false,
  animatedBorder = true,
  className = "", // ← AND THIS
}: GlowingButtonTwoProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={clsx(
        "relative inline-flex items-center justify-center px-6 py-3 text-white font-semibold text-sm uppercase tracking-wide rounded-full",
        "bg-zinc-800 border border-zinc-800 transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
        fullWidth && "w-full",
        animatedBorder && "glow-ring",
        className // ← ADD THIS LAST
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <span>{text}</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </>
      )}
    </button>
  );
}
