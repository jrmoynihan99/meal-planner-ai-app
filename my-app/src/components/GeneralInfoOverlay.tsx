// components/InfoOverlay.tsx
"use client";

import { CloseButton } from "./CloseButton";

interface InfoOverlayProps {
  onClose: () => void;
  subheading: string;
  title: string;
  description: string;
  example?: string;
}

export function GeneralInfoOverlay({
  onClose,
  subheading,
  title,
  description,
  example,
}: InfoOverlayProps) {
  return (
    <div className="fixed inset-0 z-60 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
      <div className="relative inline-flex">
        {/* Glow Border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm opacity-60 hover:opacity-100 transition-all duration-500 ease-in-out" />

        {/* Content Box */}
        <div className="relative bg-zinc-900 text-white rounded-xl p-6 w-[360px] max-w-full border border-zinc-800 shadow-xl">
          <CloseButton onClick={onClose} className="absolute top-3 right-3" />

          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
            {subheading}
          </div>

          <h2 className="text-lg font-semibold mb-4">{title}</h2>

          <p className="text-sm text-zinc-300 leading-relaxed mb-4">
            {description}
          </p>

          {example && (
            <div className="bg-zinc-800 text-zinc-100 font-mono text-xs p-3 rounded-md border border-zinc-700 whitespace-pre-line">
              {example}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
