"use client";

import { ReactNode, useState } from "react";
import { CloseButton } from "./CloseButton";

interface InfoOverlayProps {
  title: string;
  description: ReactNode;
  onClose: () => void;
}

export function InfoOverlay({ title, description, onClose }: InfoOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative inline-flex"
      >
        {/* Gradient Glow */}
        <div
          className={`absolute transition-all duration-500 ease-in-out ${
            isHovered ? "opacity-100" : "opacity-60"
          } -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm`}
        />

        {/* Content Box */}
        <div className="relative bg-zinc-900 text-white rounded-xl p-6 max-w-md w-full border border-zinc-800 shadow-xl">
          <CloseButton onClick={onClose} className="absolute top-3 right-3" />
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          <div className="prose prose-invert text-sm">{description}</div>
        </div>
      </div>
    </div>
  );
}
