"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { Typewriter } from "../components/Typewriter";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isThinking, setIsThinking] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const chatCanvasRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      onResponse: () => setIsThinking(false),
      onFinish: () => setIsThinking(false),
    });

  const lastMessage = messages[messages.length - 1];
  const hasAssistantResponse =
    lastMessage?.role === "assistant" && lastMessage?.content;

  useLayoutEffect(() => {
    if (hasAssistantResponse && isThinking) {
      setIsThinking(false);
    }
  }, [hasAssistantResponse, isThinking]);

  useLayoutEffect(() => {
    const container = chatCanvasRef.current;
    if (!container || !autoScrollEnabled) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking, autoScrollEnabled]);

  useEffect(() => {
    const container = chatCanvasRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom =
        Math.abs(
          container.scrollHeight - container.scrollTop - container.clientHeight
        ) < 50;

      setAutoScrollEnabled(isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    const container = chatCanvasRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      setAutoScrollEnabled(true);
    }
  };

  const submitMessage = () => {
    if (!input.trim() || isLoading) return;
    setIsThinking(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    handleSubmit();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-50 bg-zinc-800 px-4 py-3 border-b border-zinc-700 flex items-baseline gap-2">
        <h1 className="text-lg sm:text-xl font-semibold mr-4">
          Meal Planner AI Chat
        </h1>
        <Typewriter
          texts={["Automate Your Meals", "Plan Your Week", "Cook with Ease"]}
          typingSpeed={100}
          deletingSpeed={50}
          delayBeforeDelete={1200}
          delayBetween={500}
          fontClass="font-mono"
          sizeClass="text-sm sm:text-base"
          colorClass="text-gray-400"
        />
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div
          id="chat-canvas"
          ref={chatCanvasRef}
          className="flex-1 overflow-y-auto scroll-smooth px-2 pt-4"
        >
          <div className="w-full max-w-[95%] sm:max-w-[66%] mx-auto space-y-4 pb-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isLast = idx === messages.length - 1;

                return msg.role === "user" ? (
                  <motion.div
                    key={`user-${idx}`}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="font-mono text-xs sm:text-sm max-w-[80%] px-3 py-2 break-words whitespace-pre-wrap rounded-lg bg-zinc-700 text-white self-end ml-auto"
                  >
                    {msg.content}
                  </motion.div>
                ) : (
                  <div
                    key={`assistant-${idx}`}
                    data-last-message={isLast ? "true" : undefined}
                    className="font-mono text-xs sm:text-sm max-w-[80%] px-3 py-2 break-words whitespace-pre-wrap rounded-lg text-white self-start mr-auto"
                  >
                    {msg.role === "assistant" && isLast ? (
                      <Typewriter
                        texts={[msg.content]}
                        typingSpeed={5}
                        deletingSpeed={0}
                        delayBeforeDelete={999999}
                        delayBetween={0}
                        fontClass="font-mono"
                        sizeClass="text-xs sm:text-sm"
                        colorClass="text-white"
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                );
              })}
            </AnimatePresence>

            {isThinking && !hasAssistantResponse && (
              <div className="font-mono text-xs text-gray-400 animate-pulse">
                Thinking...
              </div>
            )}
          </div>
        </div>

        <div
          className={`absolute bottom-5 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
            autoScrollEnabled ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <button
            onClick={scrollToBottom}
            className="p-1 rounded-full bg-black text-white border border-white/40 hover:border-white/60 hover:bg-zinc-800 shadow-md transition cursor-pointer"
            aria-label="Scroll to bottom"
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>
        </div>
      </main>

      <footer className="sticky bottom-0 z-50 bg-zinc-900 px-4 pb-4 min-h-24">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMessage();
          }}
        >
          <div className="relative flex flex-col items-stretch justify-start bg-zinc-800 border border-zinc-700 rounded-4xl px-4 pt-0 shadow-md w-full max-w-[95%] sm:w-[66%] sm:hover:w-[70%] mx-auto transition-all duration-300 min-h-[3.25rem]">
            <textarea
              ref={textareaRef}
              className="w-full text-sm sm:text-base font-mono text-white bg-transparent focus:outline-none px-2 pr-10 placeholder-gray-400 resize-none overflow-hidden break-words whitespace-pre-wrap leading-[1.25rem] sm:leading-[1.5rem] py-[0.75rem] sm:py-[1rem] max-h-24 sm:max-h-40"
              placeholder="Type your message..."
              value={input}
              name="message"
              rows={1}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitMessage();
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={isLoading || !input.trim()}
            >
              <ArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
