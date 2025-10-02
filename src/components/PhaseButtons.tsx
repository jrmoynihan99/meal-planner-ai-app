"use client";

import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { InfoOverlay } from "./InfoOverlay";
import { Info } from "lucide-react";
import { SendIconButton } from "./SendIconButton";
import type { MouseEvent } from "react";
import {
  suggestionsByPhase,
  descriptions,
  prompts,
} from "@/lib/phaseSuggestions";

interface PhaseButtonsProps {
  onSelect: (text: string, immediate?: boolean) => void;
}

export function PhaseButtons({ onSelect }: PhaseButtonsProps) {
  const currentPhase = useAppStore((state) => state.currentPhase);
  const [buttons, setButtons] = useState<string[]>([]);
  const [infoVisible, setInfoVisible] = useState(false);
  const [activeDescription, setActiveDescription] = useState<string | null>(
    null
  );
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [animatingButtons, setAnimatingButtons] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    setButtons(suggestionsByPhase[currentPhase] || []);
  }, [currentPhase]);

  const handleInfoClick = (text: string) => {
    setActiveTitle(text);
    setActiveDescription(descriptions[text]);
    setActivePrompt(prompts[text]);
    setInfoVisible(true);
  };

  const handleArrowClick = (text: string, e: MouseEvent<Element>) => {
    e.stopPropagation();
    setAnimatingButtons((prev) => new Set(prev).add(text));
    setTimeout(() => onSelect(prompts[text] || text, true), 200);
    setTimeout(() => {
      setAnimatingButtons((prev) => {
        const newSet = new Set(prev);
        newSet.delete(text);
        return newSet;
      });
    }, 800);
  };

  if (!buttons.length) return null;

  return (
    <>
      <div className="flex gap-3 mb-4 overflow-x-auto whitespace-nowrap sm:flex-wrap sm:justify-center sm:overflow-visible hide-scrollbar -mx-4 px-4">
        {buttons.map((text) => (
          <div
            key={text}
            className="relative inline-flex group focus-within:outline-none"
          >
            {/* Tooltip outside hoverable element */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden md:block w-max max-w-xs px-3 py-2 rounded bg-zinc-800 text-xs text-zinc-200 border border-zinc-700 shadow-md whitespace-pre-line z-50 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              {prompts[text]}
            </div>

            {/* Only this part is hoverable */}
            <div className="relative flex items-center justify-between gap-2 px-4 py-4 text-sm font-medium font-sans text-zinc-200 transition-colors duration-200 bg-zinc-800 hover:bg-zinc-700 rounded-xl focus:outline-none cursor-pointer whitespace-nowrap shrink-0">
              <span
                onClick={() => onSelect(prompts[text] || text, false)}
                className="cursor-pointer"
              >
                {text}
              </span>

              <div className="flex items-center gap-1">
                <Info
                  size={16}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInfoClick(text);
                  }}
                  className="text-zinc-400 hover:text-white transition"
                  aria-hidden="true"
                />
                <div
                  className="relative h-4 w-4"
                  onClick={(e) => handleArrowClick(text, e)}
                >
                  <SendIconButton
                    isAnimating={animatingButtons.has(text)}
                    onClick={(e) => handleArrowClick(text, e)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {infoVisible && activeTitle && activeDescription && (
        <InfoOverlay
          title={activeTitle}
          description={activeDescription}
          prompt={activePrompt || ""}
          onClose={() => setInfoVisible(false)}
          showHelp={true}
        />
      )}
    </>
  );
}
