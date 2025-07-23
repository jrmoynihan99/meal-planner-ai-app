"use client";

import { useRef, useEffect, useState } from "react";

export function useScrollManager(
  messageCount: number,
  streamingMessage: string
) {
  const chatCanvasRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = (smooth = true) => {
    const container = chatCanvasRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    const container = chatCanvasRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 50;
      setShouldAutoScroll(isNearBottom);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll) scrollToBottom(true);
  }, [messageCount, streamingMessage]);

  return {
    chatCanvasRef,
    messagesContainerRef,
    shouldAutoScroll,
    setShouldAutoScroll,
    scrollToBottom,
  };
}
