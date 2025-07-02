"use client";

import { useEffect, useState } from "react";

interface TypewriterRevealProps {
  lines: string[];
  typingSpeed?: number;
  delayBetween?: number;
  className?: string;
  onComplete?: () => void; // ✅ NEW PROP
}

export default function TypewriterReveal({
  lines,
  typingSpeed = 30,
  delayBetween = 600,
  className = "",
  onComplete,
}: TypewriterRevealProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [hasFiredOnComplete, setHasFiredOnComplete] = useState(false); // ✅ Prevent double fire

  useEffect(() => {
    // ✅ Fire onComplete once after all lines finish
    if (currentLineIndex >= lines.length && !hasFiredOnComplete && onComplete) {
      setHasFiredOnComplete(true);
      onComplete();
    }
  }, [currentLineIndex, lines.length, hasFiredOnComplete, onComplete]);

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;

    const line = lines[currentLineIndex];

    if (currentText.length < line.length) {
      const timeout = setTimeout(() => {
        setCurrentText(line.slice(0, currentText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
        setCurrentText("");
        setCurrentLineIndex((prev) => prev + 1);
      }, delayBetween);
      return () => clearTimeout(timeout);
    }
  }, [currentText, currentLineIndex, lines, typingSpeed, delayBetween]);

  return (
    <div className={`space-y-2 ${className}`}>
      {visibleLines.map((line, idx) => (
        <div key={idx}>{line}</div>
      ))}
      {currentLineIndex < lines.length && (
        <div>
          {currentText}
          <span className="inline-block w-1 h-5 bg-white ml-1 animate-pulse" />
        </div>
      )}
    </div>
  );
}
