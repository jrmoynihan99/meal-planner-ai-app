"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { CloseButton } from "./CloseButton";
import { ArrowUpIcon, Info, Copy, Check } from "lucide-react";

interface InfoOverlayProps {
  title: string;
  description: ReactNode;
  onClose: () => void;
  showHelp?: boolean;
  prompt?: string;
}

export function InfoOverlay({
  title,
  description,
  onClose,
  showHelp = true,
  prompt,
}: InfoOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative inline-flex"
      >
        {/* Glow border */}
        <div
          className={`absolute transition-all duration-500 ease-in-out ${
            isHovered ? "opacity-100" : "opacity-60"
          } -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm`}
        />

        {/* Content box */}
        <div className="relative bg-zinc-900 text-white rounded-xl p-6 max-w-md w-full border border-zinc-800 shadow-xl">
          <CloseButton onClick={onClose} className="absolute top-3 right-3" />
          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
            Suggestion
          </div>
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          <div className="prose prose-invert text-sm mb-4">{description}</div>

          {prompt && (
            <>
              <div className="relative mb-4">
                <div className="flex bg-zinc-800 border border-zinc-700 rounded-md overflow-hidden">
                  {/* Prompt Text */}
                  <pre className="font-mono text-sm text-zinc-300 px-3 py-3 overflow-x-auto whitespace-pre-wrap break-words flex-1">
                    {prompt}
                  </pre>

                  {/* Vertical Divider + Copy Icon */}
                  <div className="flex items-center justify-center border-l border-zinc-700 bg-zinc-800 px-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(prompt);
                        setShowCopied(true);
                        setTimeout(() => setShowCopied(false), 2000);
                      }}
                      className="text-zinc-400 hover:text-white transition cursor-pointer"
                      aria-label="Copy to clipboard"
                    >
                      {showCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="my-5 border-t border-zinc-700" />
            </>
          )}

          {showHelp && (
            <div className="space-y-4 text-sm text-zinc-300">
              {/* Example Button */}
              <div className="flex items-center gap-3">
                <div className="relative inline-flex items-center gap-2 px-3 py-2 text-sm bg-zinc-800 text-white rounded-lg border border-zinc-700">
                  <span>Vegetarian</span>
                </div>
                <p className="text-xs text-zinc-400 leading-snug">
                  <span className="text-white font-medium">
                    Click the suggestion box
                  </span>{" "}
                  to prefill the input so you can edit or send it.
                </p>
              </div>

              {/* Send Icon */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                  <ArrowUpIcon className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-xs text-zinc-400 leading-snug">
                  <span className="text-white font-medium">
                    Click the arrow
                  </span>{" "}
                  to send the suggestion instantly.
                </p>
              </div>

              {/* Info Icon */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                  <Info className="h-4 w-4 text-zinc-400" />
                </div>
                <p className="text-xs text-zinc-400 leading-snug">
                  <span className="text-white font-medium">
                    Click the info icon
                  </span>{" "}
                  to view details about this suggestion.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
