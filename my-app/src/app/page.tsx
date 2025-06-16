"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { Typewriter } from "../components/Typewriter";
import { useChat } from "ai/react";

export default function Home() {
  const [isThinking, setIsThinking] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      onResponse: () => {
        // Hide thinking animation when response starts streaming
        setIsThinking(false);
      },
      onFinish: () => {
        // Response is complete
        setIsThinking(false);
      },
    });

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const lastMessage = container.querySelector("[data-last-message]");
    if (lastMessage instanceof HTMLElement) {
      const containerTop = container.getBoundingClientRect().top;
      const messageTop = lastMessage.getBoundingClientRect().top;
      const offset = messageTop - containerTop;
      container.scrollTo({ top: offset, behavior: "smooth" });
    }
  }, [messages, isThinking]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Show thinking animation
    setIsThinking(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Use the AI SDK's handleSubmit
    handleSubmit(e);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="bg-zinc-800 px-4 py-3 border-b border-zinc-700 flex items-baseline gap-2">
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

      {/* Message Area */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain flex justify-center px-2 pt-4"
      >
        <div className="w-full max-w-[95%] sm:max-w-[66%] mx-auto space-y-4 pb-6">
          {messages.map((msg, idx) => {
            const isLast = idx === messages.length - 1;
            return (
              <div
                key={msg.id || idx}
                data-last-message={isLast ? "true" : undefined}
                className={`
                  font-mono text-xs sm:text-sm max-w-[80%] px-3 py-2 
                  break-words whitespace-pre-wrap rounded-lg
                  ${
                    msg.role === "user"
                      ? "bg-zinc-700 text-white self-end ml-auto"
                      : "text-white self-start mr-auto"
                  }
                `}
              >
                {msg.content}
              </div>
            );
          })}

          {/* Thinking Animation */}
          {isThinking && (
            <div
              data-last-message="true"
              className="font-mono text-xs sm:text-sm max-w-[80%] px-3 py-2 text-white self-start mr-auto"
            >
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span className="text-gray-400 ml-2">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Input */}
      <footer className="bg-zinc-900 px-4 pb-4 min-h-24">
        <form onSubmit={handleFormSubmit}>
          <div
            className="
              relative flex flex-col items-stretch justify-start 
              bg-zinc-800 border border-zinc-700 
              rounded-4xl px-4 pt-0 shadow-md 
              w-full max-w-[95%] sm:w-[66%] sm:hover:w-[70%] mx-auto 
              transition-all duration-300 min-h-[3.25rem]
            "
          >
            <textarea
              ref={textareaRef}
              className="
                w-full text-sm sm:text-base font-mono text-white bg-transparent 
                focus:outline-none px-2 pr-10 placeholder-gray-400 
                resize-none overflow-hidden 
                break-words whitespace-pre-wrap 
                leading-[1.25rem] sm:leading-[1.5rem] 
                py-[0.75rem] sm:py-[1rem] max-h-24 sm:max-h-40
              "
              placeholder="Type your message..."
              value={input}
              name="message"
              rows={1}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(e as any);
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
