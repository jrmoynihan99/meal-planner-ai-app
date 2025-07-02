"use client";

import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

interface GlowingButtonProps {
  onClick: () => void;
  text: string;
  loading?: boolean;
}

export function GlowingButton({
  onClick,
  text,
  loading = false,
}: GlowingButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative group inline-flex">
        {/* Glow Border */}
        <div className="absolute -inset-[2px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Actual Button */}
        <button
          onClick={onClick}
          disabled={loading}
          className="relative z-10 px-6 py-3 bg-zinc-900 text-white font-semibold text-sm uppercase tracking-wide rounded-full flex items-center justify-center space-x-2 border border-zinc-700 shadow-md hover:bg-zinc-800 transition cursor-pointer min-w-[140px] group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>{text}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
