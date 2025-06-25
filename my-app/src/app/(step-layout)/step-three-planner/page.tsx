"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { PhaseButtons } from "@/components/PhaseButtons";
import { SendIconButton } from "@/components/SendIconButton";
import { useAppStore } from "@/lib/store";
import type { Message } from "ai";
import type { Phase } from "@/lib/store";

const MessageWrapper = motion.div;

export default function StepThreePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [processedMessages, setProcessedMessages] = useState<Set<string>>(
    new Set()
  );
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const chatCanvasRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  const currentPhase = useAppStore((state) => state.currentPhase);
  const setPhase = useAppStore((state) => state.setPhase);
  const stepOneData = useAppStore((state) => state.stepOneData);
  const stepTwoData = useAppStore((state) => state.stepTwoData);
  const stepThreeData = useAppStore((state) => state.stepThreeData);

  const scrollToBottom = (smooth = true) => {
    const container = chatCanvasRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const extractJsonFromMessage = (content: string): any | null => {
    const match = content.match(/```json\\s*([\\s\\S]*?)\\s*```/);
    if (!match) return null;

    try {
      return JSON.parse(match[1]);
    } catch (err) {
      console.warn("❌ Failed to parse JSON block:", err);
      return null;
    }
  };

  const handleParsedData = useCallback(
    (data: any) => {
      if (!data || typeof data !== "object") return;

      switch (currentPhase) {
        case "ingredients":
          if (Array.isArray(data.approvedIngredients)) {
            useAppStore.getState().setStepThreeData({
              approvedIngredients: data.approvedIngredients,
            });
          }
          break;

        case "meal_count":
          if (typeof data.numberOfMeals === "number") {
            useAppStore.getState().setStepThreeData({
              numberOfMeals: data.numberOfMeals,
            });
          }
          break;

        case "meal_generation":
          if (Array.isArray(data.meals)) {
            useAppStore.getState().setStepThreeData({
              meals: data.meals,
            });
          }
          break;

        case "weekly_assignment":
          if (typeof data.weeklySchedule === "object") {
            useAppStore.getState().setStepThreeData({
              weeklySchedule: data.weeklySchedule,
            });
          }
          break;

        default:
          break;
      }
    },
    [currentPhase]
  );

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
    setShouldAutoScroll(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: currentPhase,
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
      let assistantContent = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setStreamingMessage(assistantContent);
        }
        done = readerDone;
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantContent,
      };

      console.log("📩 Full assistant message:\n", assistantContent);

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessage("");

      // 🧠 Try to extract and log JSON block
      const match = assistantContent.match(/```json\s*([\s\S]+?)\s*```/);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          console.log("✅ Parsed JSON block:", parsed);

          // Check and handle approvedIngredients inside parsed.data
          if (
            parsed.type === "approved_ingredients" &&
            parsed.data?.approvedIngredients
          ) {
            console.log(
              "🧠 Storing approvedIngredients:",
              parsed.data.approvedIngredients
            );

            // Merge into existing stepThreeData, preserving other fields
            const current = useAppStore.getState().stepThreeData;
            useAppStore.getState().setStepThreeData({
              ...current,
              approvedIngredients: parsed.data.approvedIngredients,
            });
          }
        } catch (err) {
          console.warn("❌ Failed to parse JSON from GPT:", err);
        }
      } else {
        console.log("ℹ️ No JSON block found in assistant message.");
      }

      extractPhaseFromMessage(assistantContent);

      const parsed = extractJsonFromMessage(assistantContent);
      if (parsed) {
        handleParsedData(parsed);
      }
    } catch (err) {
      console.error("Streaming error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const extractPhaseFromMessage = (content: string) => {
    console.log("🔍 Checking assistant content for phase tag:");
    console.log(content);

    const match = content.match(/<!--\s*phase:\s*(\w+)\s*-->/i);

    if (match) {
      const newPhase = match[1] as Phase;
      console.log(`✅ Found phase tag: "${newPhase}"`);

      if (newPhase !== currentPhase) {
        console.log(
          `🔄 Updating phase from "${currentPhase}" to "${newPhase}"`
        );
        setPhase(newPhase);
      } else {
        console.log("ℹ️ Phase tag matches current phase. No update needed.");
      }
    } else {
      console.warn("⚠️ No phase tag found in assistant message.");
    }
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
  }, [messages.length, streamingMessage]);

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

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <main className="flex flex-col flex-1 min-h-0">
        <div
          ref={chatCanvasRef}
          className="flex-1 overflow-y-auto min-h-0 scroll-smooth custom-scrollbar"
        >
          <div
            ref={messagesContainerRef}
            className="w-full max-w-[95%] sm:max-w-[66%] mx-auto px-4 sm:px-8 space-y-4 pb-6"
          >
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`w-full flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <MessageWrapper
                  className={`text-sm sm:text-sm px-3 py-2 break-words rounded-lg ${
                    msg.role === "user"
                      ? "bg-indigo-500 text-white max-w-[80%] px-5 py-3 whitespace-pre-wrap rounded-2xl sm:rounded-3xl"
                      : "text-white w-full font-mono"
                  }`}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert text-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                </MessageWrapper>
              </div>
            ))}

            {streamingMessage && (
              <div className="w-full flex justify-start font-mono">
                <div className="text-white w-full text-sm sm:text-sm font-mono">
                  <span className="whitespace-pre-wrap">
                    {streamingMessage}
                  </span>
                  <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
                </div>
              </div>
            )}

            {isLoading && !streamingMessage && (
              <div className="font-mono text-xs text-gray-400 animate-pulse">
                Thinking...
              </div>
            )}
          </div>
        </div>

        <div
          className={`absolute bottom-5 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
            shouldAutoScroll ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <button
            onClick={() => {
              scrollToBottom(true);
              setShouldAutoScroll(true);
            }}
            className="p-1 rounded-full bg-black text-white border border-white/40 hover:border-white/60 hover:bg-zinc-800 shadow-md transition cursor-pointer"
            aria-label="Scroll to bottom"
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>
        </div>
      </main>

      <footer
        ref={footerRef}
        className="sticky bottom-0 z-50 bg-black px-4 pb-12 pt-4 sm:pb-8 min-h-28"
      >
        <div className="w-full max-w-[95%] sm:max-w-[66%] mx-auto space-y-2 mb-2">
          <div className="flex justify-center">
            <button
              onClick={() => setShowSuggestions((prev) => !prev)}
              className="flex items-center gap-1 text-sm font-mono text-white/70 hover:text-white transition"
            >
              {showSuggestions ? "Hide suggestions" : "Show suggestions"}
              {showSuggestions ? (
                <ChevronDownIcon className="w-4 h-4 transition-transform" />
              ) : (
                <ChevronUpIcon className="w-4 h-4 transition-transform" />
              )}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showSuggestions && (
              <motion.div
                key="phase-buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <PhaseButtons
                  onSelect={(text, immediate) => {
                    if (immediate) {
                      sendMessage(text);
                    } else {
                      setInput(text);
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="relative flex group w-full max-w-[95%] sm:w-[66%] sm:hover:w-[70%] mx-auto transition-all duration-300">
            <div className="absolute glow-static" />
            <div className="absolute glow-focus group-focus-within:opacity-100" />
            <div className="relative flex flex-col items-stretch justify-start bg-zinc-800 border border-zinc-700 rounded-4xl px-4 pt-0 shadow-md w-full min-h-[3.25rem]">
              <textarea
                ref={textareaRef}
                className="w-full text-base font-mono text-white bg-transparent focus:outline-none px-2 pr-10 placeholder-gray-400 resize-none overflow-hidden break-words whitespace-pre-wrap h-[3rem] leading-[3rem]"
                placeholder="Ask or share anything..."
                value={input}
                name="message"
                rows={1}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit();
                  }
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={isLoading || !input.trim()}
              >
                <SendIconButton
                  isAnimating={false}
                  colorClass="text-white hover:text-zinc-300"
                  onClick={() => {}}
                />
              </button>
            </div>
          </div>
        </form>
      </footer>
    </div>
  );
}
