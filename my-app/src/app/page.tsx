"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { useChat } from "ai/react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import type { Message } from "ai";
import { PhaseButtons } from "@/components/PhaseButtons";
import { MenuButton } from "@/components/MenuButton";

const MessageWrapper = motion.div;

export default function Home() {
  const [processedMessages, setProcessedMessages] = useState<Set<string>>(
    new Set()
  );
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const chatCanvasRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: "/api/chat" });

  const lastMessage = messages[messages.length - 1];
  const hasAssistantResponse =
    lastMessage?.role === "assistant" && lastMessage?.content;

  const scrollToBottom = (smooth = true) => {
    const container = chatCanvasRef.current;
    if (!container) return;

    if (smooth) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  };

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
    if (messages.length > 0) {
      scrollToBottom(true);
      setShouldAutoScroll(true);
    }
  }, [messages.length]);

  useEffect(() => {
    if (isLoading && shouldAutoScroll) {
      const container = chatCanvasRef.current;
      if (!container) return;

      const observer = new MutationObserver(() => {
        if (shouldAutoScroll) {
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
          });
        }
      });

      const messagesContainer = messagesContainerRef.current;
      if (messagesContainer) {
        observer.observe(messagesContainer, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }

      return () => observer.disconnect();
    }
  }, [isLoading, shouldAutoScroll]);

  useEffect(() => {
    if (!isLoading && lastMessage?.role === "assistant" && lastMessage?.id) {
      const messageId = lastMessage.id;
      if (!processedMessages.has(messageId)) {
        const timer = setTimeout(() => {
          setProcessedMessages((prev) => new Set([...prev, messageId]));
          if (shouldAutoScroll) {
            setTimeout(() => {
              scrollToBottom(true);
            }, 50);
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, lastMessage, processedMessages, shouldAutoScroll]);

  useEffect(() => {
    const container = chatCanvasRef.current;
    const messagesContainer = messagesContainerRef.current;
    if (!container || !messagesContainer) return;

    if (processedMessages.size > 0 && shouldAutoScroll) {
      const resizeObserver = new ResizeObserver(() => {
        if (shouldAutoScroll) {
          setTimeout(() => {
            scrollToBottom(false);
          }, 10);
        }
      });

      resizeObserver.observe(messagesContainer);
      return () => resizeObserver.disconnect();
    }
  }, [processedMessages.size, shouldAutoScroll]);

  const shouldRenderAsMarkdown = (msg: Message) =>
    msg.role === "assistant" &&
    msg.id &&
    processedMessages.has(msg.id) &&
    !isLoading;

  const isStreamingMessage = (msg: Message, idx: number) =>
    msg.role === "assistant" && idx === messages.length - 1 && isLoading;

  const handleFormSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    setShouldAutoScroll(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    handleSubmit();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const updateInputFromButton = (text: string) => {
    handleInputChange({
      target: { value: text } as HTMLTextAreaElement,
    } as React.ChangeEvent<HTMLTextAreaElement>);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-zinc-900 text-white">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #27272a;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #52525b;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #71717a;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #52525b #27272a;
        }
      `}</style>

      <header className="sticky top-0 z-50 bg-zinc-800 px-4 py-3 border-b border-zinc-700">
        <div className="flex items-center justify-start gap-3">
          <MenuButton onClick={() => console.log("Menu clicked")} />
          <h1 className="text-lg sm:text-xl font-semibold whitespace-nowrap">
            Meal Planner AI Chat
          </h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div
          ref={chatCanvasRef}
          className="flex-1 overflow-y-auto scroll-smooth px-2 pt-4 custom-scrollbar"
        >
          <div
            ref={messagesContainerRef}
            className="w-full max-w-[95%] sm:max-w-[66%] mx-auto space-y-4 pb-6"
          >
            {messages.map((msg, idx) => {
              const isLast = idx === messages.length - 1;
              const renderAsMarkdown = shouldRenderAsMarkdown(msg);
              const isCurrentlyStreaming = isStreamingMessage(msg, idx);

              return (
                <div
                  key={msg.id || idx}
                  className={`w-full flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <MessageWrapper
                    data-last-message={isLast ? "true" : undefined}
                    className={`text-sm sm:text-sm px-3 py-2 break-words rounded-lg ${
                      msg.role === "user"
                        ? "bg-zinc-700 text-white max-w-[80%] whitespace-pre-wrap"
                        : "text-white w-full font-mono"
                    }`}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {msg.role === "assistant" ? (
                      <div
                        className={`transition-opacity duration-200 ${
                          renderAsMarkdown
                            ? "prose prose-invert prose-xs max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_ul]:my-4 [&_ol]:my-4 [&_table]:my-4 [&_li]:mb-1 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h1]:mb-3 [&_h2]:mb-2 [&_h3]:mb-2 [&_table]:w-full [&_table]:border [&_th]:border [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:px-2 [&_th]:py-1 [&_thead]:bg-zinc-800 [&_tbody_tr:nth-child(odd)]:bg-zinc-900 [&_tbody_tr:nth-child(even)]:bg-zinc-800"
                            : ""
                        }`}
                      >
                        {renderAsMarkdown ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          <div className="min-h-[1.25rem]">
                            <span className="whitespace-pre-wrap">
                              {msg.content}
                              {isCurrentlyStreaming && (
                                <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                  </MessageWrapper>
                </div>
              );
            })}

            {isLoading && !hasAssistantResponse && (
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
        className="sticky bottom-0 z-50 bg-zinc-900 px-4 pb-12 pt-4 sm:pb-8 min-h-28"
      >
        <div className="w-full max-w-[95%] sm:max-w-[66%] mx-auto space-y-3 mb-6">
          <PhaseButtons
            onSelect={(text, immediate) => {
              if (immediate) {
                handleInputChange({
                  target: { value: text } as HTMLTextAreaElement,
                } as React.ChangeEvent<HTMLTextAreaElement>);
                handleSubmit();
              } else {
                handleInputChange({
                  target: { value: text } as HTMLTextAreaElement,
                } as React.ChangeEvent<HTMLTextAreaElement>);
              }
            }}
          />
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="relative flex group w-full max-w-[95%] sm:w-[66%] sm:hover:w-[70%] mx-auto transition-all duration-300">
            {/* Glow border */}
            <div className="absolute -inset-[2px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-3xl blur-sm opacity-60 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Input wrapper */}
            <div className="relative flex flex-col items-stretch justify-start bg-zinc-800 border border-zinc-700 rounded-4xl px-4 pt-0 shadow-md w-full min-h-[3.25rem]">
              <textarea
                ref={textareaRef}
                className="w-full text-base font-mono text-white bg-transparent focus:outline-none px-2 pr-10 placeholder-gray-400 resize-none overflow-hidden break-words whitespace-pre-wrap h-[3rem] leading-[3rem]"
                placeholder="Type your message..."
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
                <ArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </form>
      </footer>
    </div>
  );
}
