"use client";

import { useState, useEffect } from "react";

interface TypewriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBeforeDelete?: number;
  delayBetween?: number;
  fontClass?: string;
  sizeClass?: string;
  colorClass?: string;
  onTypingEnd?: () => void; // ✅ new
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
}: TypewriterProps) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const fullText = texts[index];

  useEffect(() => {
    // Finished typing forward
    if (!deleting && subIndex === fullText.length) {
      onTypingEnd?.(); // ✅ trigger callback
      const t = setTimeout(() => setDeleting(true), delayBeforeDelete);
      return () => clearTimeout(t);
    }

    // Finished deleting
    if (deleting && subIndex === 0) {
      const t = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % texts.length);
      }, delayBetween);
      return () => clearTimeout(t);
    }

    const t = setTimeout(
      () => setSubIndex((i) => i + (deleting ? -1 : 1)),
      deleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(t);
  }, [
    subIndex,
    deleting,
    fullText,
    typingSpeed,
    deletingSpeed,
    delayBeforeDelete,
    delayBetween,
    texts,
    onTypingEnd,
  ]);

  return (
    <span className={`${fontClass} ${sizeClass} ${colorClass}`}>
      {fullText.substring(0, subIndex)}
      <span className="inline-block w-1 bg-white animate-pulse ml-1" />
    </span>
  );
}
