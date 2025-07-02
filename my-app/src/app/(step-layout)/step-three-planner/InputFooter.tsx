"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { PhaseButtons } from "@/components/PhaseButtons";
import { SendIconButton } from "@/components/SendIconButton";

interface InputFooterProps {
  input: string;
  setInput: (val: string) => void;
  handleFormSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  sendMessage: (content: string) => void;
}

export function InputFooter({
  input,
  setInput,
  handleFormSubmit,
  handleTextareaChange,
  isLoading,
  textareaRef,
  sendMessage,
}: InputFooterProps) {
  const footerRef = useRef<HTMLElement | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
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
              id="chat-input"
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
  );
}
