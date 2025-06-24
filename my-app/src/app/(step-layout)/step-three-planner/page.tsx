"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import type { Message } from "ai";
import { PhaseButtons } from "@/components/PhaseButtons";
import { SendIconButton } from "@/components/SendIconButton";
import { useAppStore } from "@/lib/store";
import type { Phase } from "@/lib/store";

const MessageWrapper = motion.div;

export default function Home() {
  const [processedMessages, setProcessedMessages] = useState<Set<string>>(
    new Set()
  );
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false); // 👈 new state

  const chatCanvasRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  const currentPhase = useAppStore((state) => state.currentPhase);
  const setPhase = useAppStore((state) => state.setPhase);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
  } = useChat({
    api: "/api/chat",
    body: { phase: currentPhase },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Welcome! Now that we have your daily calorie and protein targets, the last thing we need to do is make your meals.

This is an open AI style conversation. We've included suggestions below, but feel free to type anything you want at any time.

Are you ready to get started?`,
      },
    ],
  });

  const lastMessage = messages[messages.length - 1];
  const hasAssistantResponse =
    lastMessage?.role === "assistant" && lastMessage?.content;

  const scrollToBottom = (smooth = true) => {
    const container = chatCanvasRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const sendDirectMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    await append({ role: "user", content: text });

    handleInputChange({
      target: { value: "" },
    } as React.ChangeEvent<HTMLTextAreaElement>);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setShouldAutoScroll(true);
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

  useEffect(() => {
    if (messages.length === 0) {
      append({
        role: "assistant",
        content: `Welcome! Now that we have your daily calorie and protein targets, the last thing we need to do is make your meals.

This is an open AI style conversation. We've included suggestions below, but feel free to type anything you want at any time.

Are you ready to get started?`,
      });
    }
  }, [messages.length, append]);

  useEffect(() => {
    if (
      lastMessage?.role === "assistant" &&
      typeof lastMessage.content === "string"
    ) {
      console.log("🧠 Raw assistant message:", lastMessage.content); // 👈 logs full response

      const match = lastMessage.content.match(/<!--\s*phase:\s*(\w+)\s*-->/i);
      if (match) {
        const newPhase = match[1] as Phase;
        if (newPhase && newPhase !== currentPhase) {
          console.log("🔄 Updating phase to:", newPhase);
          setPhase(newPhase);
        }
      }
    }
  }, [lastMessage, currentPhase, setPhase]);

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
                        ? "bg-indigo-500 text-white max-w-[80%] px-5 py-3 break-words whitespace-pre-wrap rounded-2xl sm:rounded-3xl"
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
                      sendDirectMessage(text);
                    } else {
                      handleInputChange({
                        target: { value: text } as HTMLTextAreaElement,
                      } as React.ChangeEvent<HTMLTextAreaElement>);
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
