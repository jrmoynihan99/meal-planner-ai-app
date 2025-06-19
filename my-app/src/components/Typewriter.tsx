"use client";

import { useEffect, useState } from "react";

interface TypewriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBeforeDelete?: number;
  delayBetween?: number;
  fontClass?: string;
  sizeClass?: string;
  colorClass?: string; // <-- this is now properly applied
}

export function Typewriter({
  texts,
  typingSpeed = 50,
  deletingSpeed = 30,
  delayBeforeDelete = 2000,
  delayBetween = 1000,
  fontClass = "font-sans",
  sizeClass = "text-base",
  colorClass = "",
}: TypewriterProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentText = texts[textIndex];

    if (!isDeleting && displayedText.length < currentText.length) {
      timeout = setTimeout(() => {
        setDisplayedText(currentText.slice(0, displayedText.length + 1));
      }, typingSpeed);
    } else if (isDeleting && displayedText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayedText(currentText.slice(0, displayedText.length - 1));
      }, deletingSpeed);
    } else if (!isDeleting && displayedText === currentText) {
      timeout = setTimeout(() => setIsDeleting(true), delayBeforeDelete);
    } else if (isDeleting && displayedText === "") {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }, delayBetween);
    }

    return () => clearTimeout(timeout);
  }, [
    displayedText,
    isDeleting,
    texts,
    textIndex,
    typingSpeed,
    deletingSpeed,
    delayBeforeDelete,
    delayBetween,
  ]);

  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${fontClass} ${sizeClass} ${colorClass}`}
    >
      {displayedText}
      <span className="inline-block w-1 h-5 bg-white ml-1 animate-pulse" />
    </span>
  );
}
