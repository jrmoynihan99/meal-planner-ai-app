"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { Typewriter } from "../components/Typewriter";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input.trim() }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "This is a mock reply." },
      ]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      {/* Sticky Header with Typewriter */}
      <header className="bg-zinc-800 px-4 py-3 border-b border-zinc-700 flex items-baseline gap-2">
        <h1 className="text-xl font-semibold mr-4">Meal Planner AI Chat</h1>
        <Typewriter
          texts={["Automate Your Meals", "Plan Your Week", "Cook with Ease"]}
          typingSpeed={100}
          deletingSpeed={50}
          delayBeforeDelete={1200}
          delayBetween={500}
          fontClass="font-mono"
          sizeClass="text-base"
          colorClass="text-gray-400"
        />
      </header>

      {/* Scrollable Message Area */}
      <main
        ref={scrollContainerRef}
        className="overflow-y-auto flex justify-center px-4 pt-4"
        style={{ maxHeight: "calc(100vh - 8rem)" }}
      >
        <div className="w-full sm:w-[66%] space-y-4 pb-6">
          {messages.map((msg, idx) => {
            const isLast = idx === messages.length - 1;
            return (
              <div
                key={idx}
                data-last-message={isLast ? "true" : undefined}
                className={`
            font-mono text-sm max-w-[80%] px-4 py-2 break-words whitespace-pre-wrap
            ${
              msg.role === "user"
                ? "bg-zinc-700 text-white self-end ml-auto rounded-lg"
                : "text-white self-start mr-auto"
            }
          `}
              >
                {msg.content}
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Input Footer */}
      <footer className="bg-zinc-900 px-4 pb-4 min-h-32">
        <div
          className="
            relative flex flex-col items-stretch justify-start 
            bg-zinc-800 border border-zinc-700 
            rounded-4xl px-4 pt-0 shadow-md 
            w-full max-w-[90%] sm:w-[66%] mx-auto 
            hover:w-[70%] transition-all duration-300
            min-h-[3.25rem]
          "
        >
          <textarea
            ref={textareaRef}
            className="
              w-full text-base font-mono text-white bg-transparent 
              focus:outline-none px-2 pr-10 placeholder-gray-400 
              resize-none overflow-hidden 
              break-words whitespace-pre-wrap 
              max-h-40 leading-[1rem] py-[1rem]
            "
            placeholder="Type your message..."
            value={input}
            rows={1}
            onChange={(e) => {
              setInput(e.target.value);
              const el = e.target as HTMLTextAreaElement;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
            onClick={handleSend}
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
