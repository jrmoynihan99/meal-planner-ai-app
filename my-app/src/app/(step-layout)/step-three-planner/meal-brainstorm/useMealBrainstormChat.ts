"use client";

import { useState, useEffect, useRef } from "react";
import type { Message } from "ai";
import {
  mealBrainstormPrompt,
  mealBrainstormStarter,
} from "@/lib/prompts/mealBrainstorm";
import { useAppStore } from "@/lib/store";
import type { Meal } from "@/lib/store";

// --- Parser function ---
function parseMealsFromMessage(content: string): Meal[] {
  const lines = content.split("\n").map((line) => line.trim());
  const meals: Meal[] = [];

  let currentMeal: Partial<Meal> = {};
  let state: "none" | "name" | "description" | "ingredients" | "recipe" =
    "none";

  for (const line of lines) {
    if (line.startsWith("Meal Name:")) {
      // Save the last meal if valid
      if (currentMeal.name && currentMeal.ingredients?.length) {
        meals.push({ ...(currentMeal as Meal), id: crypto.randomUUID() });
      }
      // Start new meal
      currentMeal = {
        name: line.replace("Meal Name:", "").trim(),
        description: "",
        ingredients: [],
        recipe: [],
      };
      state = "name";
    } else if (line.startsWith("Description:")) {
      currentMeal.description = line.replace("Description:", "").trim();
      state = "description";
    } else if (line.startsWith("Ingredients:")) {
      state = "ingredients";
    } else if (line.startsWith("Recipe:")) {
      state = "recipe";
    } else if (
      (line.startsWith("•") || line.startsWith("-")) &&
      state === "ingredients"
    ) {
      const raw = line.replace(/^[-•]\s*/, "");
      const [namePart, rest] = raw.split(":");
      const name = namePart?.trim();
      const rawAmount = rest?.trim() || "";
      const amount = rawAmount.replace(/\(.*?\)/, "").trim();

      let grams: number | undefined;
      let main: 0 | 1 | undefined;

      const match = rawAmount.match(
        /^(\d+(?:\.\d+)?)g\s*\((main|non-main)\)$/i
      );
      if (match) {
        grams = parseFloat(match[1]);
        main = match[2].toLowerCase() === "main" ? 1 : 0;
      }

      if (name && currentMeal.ingredients) {
        currentMeal.ingredients.push({ name, amount, grams, main });
      }
    } else if (state === "recipe" && /^\d+\.\s/.test(line)) {
      currentMeal.recipe?.push(line.replace(/^\d+\.\s*/, "").trim());
    }
  }

  // Final push
  if (currentMeal.name && currentMeal.ingredients?.length) {
    meals.push({ ...(currentMeal as Meal), id: crypto.randomUUID() });
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

      console.log("🧠 Raw GPT Response:\n", finalVisible);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: finalVisible,
      };

      const parsedMeals = parseMealsFromMessage(finalVisible);
      console.log("✅ Parsed Meals:", parsedMeals);

      if (parsedMeals.length > 0) {
        setGeneratedMeals((prev) => {
          const updated = [...prev];
          const newUniqueMeals: Meal[] = [];

          for (const newMeal of parsedMeals) {
            const index = updated.findIndex(
              (m) => m.name.toLowerCase() === newMeal.name.toLowerCase()
            );

            if (index !== -1) {
              updated[index] = {
                ...newMeal,
                id: updated[index].id,
              };
            } else {
              newUniqueMeals.push(newMeal);
            }
          }

          const combined = [...newUniqueMeals, ...updated];
          console.log("🧩 Final setGeneratedMeals (pre-approval):", combined);
          return combined;
        });
      }

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessage("");
    } catch (err) {
      console.error("❌ Streaming error:", err);
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
