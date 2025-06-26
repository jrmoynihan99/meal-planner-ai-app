"use client";

import { useState, useEffect, useRef } from "react";
import { useMealBrainstormChat } from "./useMealBrainstormChat";
import { MessageList } from "../MessageList";
import { InputFooter } from "../InputFooter";
import { MealSidebar } from "./MealSidebar";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Meal } from "./useMealBrainstormChat";

export default function MealBrainstormPage() {
  const {
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
  } = useMealBrainstormChat();

  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const approvedMeals = stepThreeData?.approvedMeals ?? [];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chatCanvasRef = useRef<HTMLDivElement | null>(null);

  const approveMeal = (meal: Meal) => {
    const alreadyApproved = approvedMeals.some(
      (m) => m.name.toLowerCase() === meal.name.toLowerCase()
    );

    if (!alreadyApproved) {
      setStepThreeData({
        approvedMeals: [...approvedMeals, meal],
      });
    }
  };

  useEffect(() => {
    if (generatedMeals.length > 0 && window.innerWidth < 1024) {
      setIsSidebarOpen(true);
    }
  }, [generatedMeals]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false); // Force reset when switching to desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="flex h-full w-full relative bg-black text-white"
      style={{ overflowX: "clip" }}
    >
      {/* Mobile Sidebar Grab Handle */}
      <div
        className="lg:hidden fixed top-1/2 right-0 transform -translate-y-1/2 z-50"
        onClick={() => setIsSidebarOpen(true)}
      >
        <div className="bg-zinc-800 hover:bg-zinc-700 w-3 h-16 rounded-l-full cursor-pointer flex items-center justify-center">
          <div className="w-1 h-10 bg-white rounded-full" />
        </div>
      </div>

      {/* Background fade for mobile sidebar */}
      {isSidebarOpen && (
        <motion.div
          className="lg:hidden fixed inset-0 bg-black z-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main content */}
      <motion.div
        className="flex flex-col flex-1 min-w-0 z-30"
        animate={{
          x: isSidebarOpen ? -240 : 0,
          scale: isSidebarOpen ? 0.95 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ originX: 1 }}
      >
        {/* Scrollable Chat Canvas */}
        <div
          ref={chatCanvasRef}
          className="flex-1 overflow-y-auto min-h-0 scroll-smooth"
        >
          <div className="p-4 max-w-2xl mx-auto pb-6">
            <MessageList
              messages={messages}
              streamingMessage={streamingMessage}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Sticky Footer */}
        <InputFooter
          input={input}
          setInput={setInput}
          handleFormSubmit={handleFormSubmit}
          handleTextareaChange={handleTextareaChange}
          isLoading={isLoading}
          textareaRef={textareaRef}
          sendMessage={sendMessage}
        />
      </motion.div>

      {/* Desktop Sidebar */}
      <div
        className="hidden lg:flex flex-col border-l border-gray-800 bg-[#111] z-50 overflow-y-auto max-h-screen"
        style={{ width: 412, flexShrink: 0 }}
      >
        <MealSidebar
          meals={generatedMeals}
          onApprove={approveMeal}
          onTweak={() => {}}
          onReplace={() => {}}
          isMobileVisible={true}
          onCloseMobile={() => {}}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden z-50">
        <MealSidebar
          meals={generatedMeals}
          onApprove={approveMeal}
          onTweak={() => {}}
          onReplace={() => {}}
          isMobileVisible={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
