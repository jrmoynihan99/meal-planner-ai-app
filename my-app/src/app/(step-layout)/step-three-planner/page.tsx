"use client";

import { useRef, useEffect } from "react";
import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useStepThreeChat } from "./useStepThreeChat";
import { MessageList } from "./MessageList";
import { InputFooter } from "./InputFooter";
import { useScrollManager } from "./useScrollManager";

export default function StepThreePage() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    streamingMessage,
    handleFormSubmit,
    handleTextareaChange,
    sendMessage,
    textareaRef,
  } = useStepThreeChat();

  const {
    chatCanvasRef,
    messagesContainerRef,
    shouldAutoScroll,
    setShouldAutoScroll,
    scrollToBottom,
  } = useScrollManager(messages.length, streamingMessage);

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
            <MessageList
              messages={messages}
              streamingMessage={streamingMessage}
              isLoading={isLoading}
            />
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

      <InputFooter
        input={input}
        setInput={setInput}
        handleFormSubmit={handleFormSubmit}
        handleTextareaChange={handleTextareaChange}
        isLoading={isLoading}
        textareaRef={textareaRef}
        sendMessage={sendMessage}
      />
    </div>
  );
}
