"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import type { Message } from "ai";
import { handleParsedData } from "./handleParsedData";
import { extractPhaseFromMessage } from "./extractPhase";

// Define your structured Meal type
export interface Meal {
  name: string;
  description: string;
  ingredients: {
    name: string;
    amount: string;
  }[];
  recipe?: string;
}

export function useStepThreeChat(
  starterMessage?: string,
  systemPrompt?: string
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");

  const [approvedMeals, setApprovedMeals] = useState<Meal[]>([]);
  const [generatedMeals, setGeneratedMeals] = useState<Meal[]>([]); // optional future use

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

  const parseMealsFromMessage = (content: string): Meal[] => {
    // This is placeholder logic. Later, you can define a consistent GPT format and extract from markdown or hidden blocks.
    const meals: Meal[] = [];

    // Example placeholder: look for bullet lists under headings
    const mealMatches = content.split("Meal Name:");
    for (let block of mealMatches.slice(1)) {
      const lines = block.trim().split("\n");
      const name = lines[0]?.trim();
      const description = lines[1]?.trim();
      const ingredients: Meal["ingredients"] = [];

      for (let line of lines) {
        if (line.includes("•") || line.includes("-")) {
          const parts = line.replace(/[-•]\s*/, "").split(":");
          if (parts.length === 2) {
            ingredients.push({
              name: parts[0].trim(),
              amount: parts[1].trim(),
            });
          }
        }
      }

      if (name && description) {
        meals.push({ name, description, ingredients });
      }
    }

    return meals;
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
          systemPrompt,
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

          visibleContent = cleanMessageForDisplay(rawContent);
          setStreamingMessage(visibleContent);
        }
        done = readerDone;
      }

      console.log("📩 Full assistant message:\n", rawContent);

      const parsedJson = extractJsonFromMessage(rawContent);
      if (parsedJson) {
        handleParsedData(parsedJson);
      }

      extractPhaseFromMessage(rawContent);

      const displayContent = cleanMessageForDisplay(rawContent);
      const newMeals = parseMealsFromMessage(displayContent);
      if (newMeals.length > 0) {
        setGeneratedMeals(newMeals);
      }

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

  const approveMeal = (meal: Meal) => {
    setApprovedMeals((prev) => [...prev, meal]);
  };

  const regenerateMeal = (index: number) => {
    const mealName = generatedMeals[index]?.name;
    if (mealName) {
      sendMessage(`Can you suggest a different meal instead of "${mealName}"?`);
    }
  };

  const tweakMeal = (index: number, instruction: string) => {
    const mealName = generatedMeals[index]?.name;
    if (mealName) {
      sendMessage(`Can you modify "${mealName}" to ${instruction}?`);
    }
  };

  useEffect(() => {
    if (messages.length === 0 && starterMessage) {
      setMessages([
        {
          id: "starter",
          role: "assistant",
          content: starterMessage,
        },
      ]);
    }
  }, [messages.length, starterMessage]);

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
    approvedMeals,
    generatedMeals,
    approveMeal,
    regenerateMeal,
    tweakMeal,
  };
}
