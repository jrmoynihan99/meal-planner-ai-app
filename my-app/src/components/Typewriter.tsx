"use client";

import { useEffect, useState, useRef } from "react";

interface TypewriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBeforeDelete?: number;
  delayBetween?: number;
  fontClass?: string;
  sizeClass?: string;
  colorClass?: string;
  onTypingEnd?: () => void;
  isStreaming?: boolean;
}

export function Typewriter({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBeforeDelete = 1000,
  delayBetween = 500,
  fontClass = "font-sans",
  sizeClass = "text-xl",
  colorClass = "text-white",
  onTypingEnd,
  isStreaming = false,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [subIndex, setSubIndex] = useState(0);
  const previousTextRef = useRef("");
  const displayedRef = useRef(""); // NEW
  const lastTextLengthRef = useRef(0);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledOnEndRef = useRef(false);

  const fullText = texts[0] || "";

  useEffect(() => {
    if (isStreaming) {
      const current = fullText;
      const prev = displayedRef.current;

      console.log(
        "🧪 [Typewriter] useEffect fired | fullText.length:",
        current.length,
        "| prev.length:",
        prev.length
      );

      if (current.length > prev.length) {
        const nextChar = current.slice(prev.length, prev.length + 1);
        console.log(
          "✏️ Adding char:",
          nextChar,
          "| new length will be:",
          prev.length + 1
        );
        const timeout = setTimeout(() => {
          const newDisplayed = prev + nextChar;
          displayedRef.current = newDisplayed;
          previousTextRef.current = newDisplayed;
          setDisplayed(newDisplayed);
        }, typingSpeed);

        hasCalledOnEndRef.current = false;
        return () => clearTimeout(timeout);
      }

      // If no new characters for 500ms, trigger onTypingEnd
      if (!hasCalledOnEndRef.current && current.length === prev.length) {
        console.log("⏳ Waiting 500ms — possible end of stream?");
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        inactivityTimerRef.current = setTimeout(() => {
          hasCalledOnEndRef.current = true;
          console.log("🔥 onTypingEnd triggered inside Typewriter");
          onTypingEnd?.();
        }, 500);
      }
    } else {
      if (subIndex === fullText.length && !onTypingEnd) return;

      if (subIndex === fullText.length) {
        const timeout = setTimeout(() => onTypingEnd?.(), delayBeforeDelete);
        return () => clearTimeout(timeout);
      }

      const timeout = setTimeout(() => {
        setDisplayed(fullText.substring(0, subIndex + 1));
        setSubIndex((i) => i + 1);
      }, typingSpeed);

      return () => clearTimeout(timeout);
    }
  }, [
    fullText,
    subIndex,
    isStreaming,
    typingSpeed,
    delayBeforeDelete,
    onTypingEnd,
  ]);

  return (
    <span className={`${fontClass} ${sizeClass} ${colorClass}`}>
      {displayed}
      <span className="inline-block w-1 bg-white animate-pulse ml-1" />
    </span>
  );
}
