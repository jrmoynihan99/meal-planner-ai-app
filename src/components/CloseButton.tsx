"use client";

import { X } from "lucide-react";

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

export function CloseButton({ onClick, className = "" }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-md transition cursor-pointer group ${className}`}
      aria-label="Close"
    >
      <X
        className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180"
        strokeWidth={2.5}
      />
    </button>
  );
}
