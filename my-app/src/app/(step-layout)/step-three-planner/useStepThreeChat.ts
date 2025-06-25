"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import type { Message } from "ai";
import { handleParsedData } from "./handleParsedData";
import { extractPhaseFromMessage } from "./extractPhase";

export function useStepThreeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentPhase = useAppStore((s) => s.currentPhase);
  const stepOneData = useAppStore((s) => s.stepOneData);
  const stepTwoData = useAppStore((s) => s.stepTwoData);
  const stepThreeData = useAppStore((s) => s.stepThreeData);

  const extractJsonFromMessage = (content: string): any | null => {
    const match = content.match(/\[START_JSON\]([\s\S]*?)\[END_JSON\]/);
    if (!match) return null;
    try {
      return JSON.parse(match[1].trim());
    } catch (err) {
      console.warn("❌ Failed to parse structured JSON:", err);
      return null;
    }
  };

  const cleanMessageForDisplay = (content: string): string => {
    return content
      .replace(/\[START_JSON\][\s\S]*?\[END_JSON\]/g, "")
      .replace(/\[START_PHASE\][\s\S]*?\[END_PHASE\]/g, "")
      .trim();
  };

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setStreamingMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          stepOneData,
          stepTwoData,
          stepThreeData,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let rawContent = "";
      let visibleContent = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          rawContent += chunk;

          // Update only the visible part for user
          visibleContent = rawContent
            .replace(/\[START_JSON\][\s\S]*?\[END_JSON\]/g, "")
            .replace(/\[START_PHASE\][\s\S]*?\[END_PHASE\]/g, "")
            .trim();

          setStreamingMessage(visibleContent);
        }
        done = readerDone;
      }

      console.log("📩 Full assistant message:\n", rawContent);

      const parsed = extractJsonFromMessage(rawContent);
      if (parsed) {
        handleParsedData(parsed);
      }

      extractPhaseFromMessage(rawContent);

      const displayContent = cleanMessageForDisplay(rawContent);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: displayContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessage("");
    } catch (err) {
      console.error("Streaming error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    textareaRef.current?.style.setProperty("height", "auto");
    sendMessage(input.trim());
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Welcome! Now that we have your daily calorie and protein targets, the last thing we need to do is make your meals.

This is an open AI style conversation. We've included suggestions below, but feel free to type anything you want at any time.

Are you ready to get started?`,
        },
      ]);
    }
  }, [messages.length]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    streamingMessage,
    handleFormSubmit,
    handleTextareaChange,
    sendMessage,
    textareaRef,
  };
}
