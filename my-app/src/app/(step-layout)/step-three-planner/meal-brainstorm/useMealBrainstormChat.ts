"use client";

import { useState, useEffect, useRef } from "react";
import type { Message } from "ai";
import {
  mealBrainstormPrompt,
  mealBrainstormStarter,
} from "@/lib/prompts/mealBrainstorm";
import { useAppStore } from "@/lib/store";

// --- Meal type ---
export interface Meal {
  id: string;
  name: string;
  description: string;
  ingredients: {
    name: string;
    amount: string;
    protein?: number;
    calories?: number;
  }[];
  recipe: string;
}

// --- Parser function ---
function parseMealsFromMessage(content: string): Meal[] {
  const lines = content.split("\n").map((line) => line.trim());
  const meals: Meal[] = [];

  let currentMeal: Partial<Meal> = {};
  let state: "none" | "name" | "description" | "ingredients" = "none";

  for (const line of lines) {
    if (line.startsWith("Meal Name:")) {
      if (currentMeal.name && currentMeal.ingredients?.length) {
        meals.push({
          ...(currentMeal as Meal),
          id: crypto.randomUUID(),
        });
      }
      currentMeal = {
        name: line.replace("Meal Name:", "").trim(),
        description: "",
        ingredients: [],
      };
      state = "name";
    } else if (line.startsWith("Description:")) {
      currentMeal.description = line.replace("Description:", "").trim();
      state = "description";
    } else if (line.startsWith("Ingredients:")) {
      state = "ingredients";
    } else if (
      (line.startsWith("•") || line.startsWith("-")) &&
      state === "ingredients"
    ) {
      const raw = line.replace(/^[-•]\s*/, "");
      const [name, amount] = raw.split(":").map((s) => s.trim());
      if (name && currentMeal.ingredients) {
        currentMeal.ingredients.push({ name, amount: amount || "" });
      }
    }
  }

  if (currentMeal.name && currentMeal.ingredients?.length) {
    meals.push({
      ...(currentMeal as Meal),
      id: crypto.randomUUID(),
    });
  }

  return meals;
}

// --- Main Hook ---
export function useMealBrainstormChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [generatedMeals, setGeneratedMeals] = useState<Meal[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const stepOneData = useAppStore((s) => s.stepOneData);
  const stepTwoData = useAppStore((s) => s.stepTwoData);
  const stepThreeData = useAppStore((s) => s.stepThreeData);

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
          systemPrompt: mealBrainstormPrompt,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let rawContent = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          rawContent += chunk;

          const visible = rawContent
            .replace(/\[START_JSON\][\s\S]*?\[END_JSON\]/g, "")
            .replace(/\[START_PHASE\][\s\S]*?\[END_PHASE\]/g, "")
            .trim();

          setStreamingMessage(visible);
        }
        done = readerDone;
      }

      const finalVisible = rawContent
        .replace(/\[START_JSON\][\s\S]*?\[END_JSON\]/g, "")
        .replace(/\[START_PHASE\][\s\S]*?\[END_PHASE\]/g, "")
        .trim();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: finalVisible,
      };

      const parsedMeals = parseMealsFromMessage(finalVisible);
      if (parsedMeals.length > 0) {
        setGeneratedMeals((prev) => {
          const updated = [...prev];

          for (const newMeal of parsedMeals) {
            const index = updated.findIndex(
              (m) => m.name.toLowerCase() === newMeal.name.toLowerCase()
            );

            if (index !== -1) {
              // Replace meal, preserve ID
              updated[index] = {
                ...newMeal,
                id: updated[index].id,
              };
            } else {
              // New meal, already has ID from parser
              updated.push(newMeal);
            }
          }

          return updated;
        });
      }

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
          id: "starter",
          role: "assistant",
          content: mealBrainstormStarter,
        },
      ]);
    }
  }, [messages.length]);

  return {
    messages,
    input,
    isLoading,
    streamingMessage,
    generatedMeals,
    handleFormSubmit,
    handleTextareaChange,
    textareaRef,
    sendMessage,
    setInput,
    setGeneratedMeals,
  };
}
