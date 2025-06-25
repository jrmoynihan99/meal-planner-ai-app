"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Message } from "ai";

import "highlight.js/styles/github-dark.css";

interface MessageListProps {
  messages: Message[];
  streamingMessage: string;
  isLoading: boolean;
}

const MessageWrapper = motion.div;

export function MessageList({
  messages,
  streamingMessage,
  isLoading,
}: MessageListProps) {
  return (
    <>
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
              {streamingMessage
                .replace(/\[START_JSON\][\s\S]*?\[END_JSON\]/g, "")
                .replace(/\[START_PHASE\][\s\S]*?\[END_PHASE\]/g, "")
                .trim()}
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
    </>
  );
}
