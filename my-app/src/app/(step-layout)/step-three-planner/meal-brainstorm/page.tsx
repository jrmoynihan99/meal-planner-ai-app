"use client";

import { useState, useEffect } from "react";
import { useMealBrainstormChat } from "./useMealBrainstormChat";
import { MessageList } from "../MessageList";
import { InputFooter } from "../InputFooter";
import { MealSidebar } from "./MealSidebar";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Meal } from "./useMealBrainstormChat";
import { useScrollManager } from "../useScrollManager";

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
    setGeneratedMeals,
  } = useMealBrainstormChat();

  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const approvedMeals = stepThreeData?.approvedMeals ?? [];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { chatCanvasRef, shouldAutoScroll, scrollToBottom } = useScrollManager(
    messages.length,
    streamingMessage
  );

  // Populate generatedMeals with approved meals (if needed) after hydration
  useEffect(() => {
    if (
      hasHydrated &&
      approvedMeals.length > 0 &&
      generatedMeals.length === 0
    ) {
      setGeneratedMeals(approvedMeals);
    }
  }, [hasHydrated]);

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

  const unapproveMeal = (meal: Meal) => {
    const updated = approvedMeals.filter(
      (m) => m.name.toLowerCase() !== meal.name.toLowerCase()
    );
    setStepThreeData({ approvedMeals: updated });
  };

  const removeMeal = (index: number) => {
    setGeneratedMeals((prev) => {
      const mealToRemove = prev[index];

      const stillApproved = approvedMeals.some(
        (m) => m.name.toLowerCase() === mealToRemove.name.toLowerCase()
      );

      if (stillApproved) {
        const updatedApproved = approvedMeals.filter(
          (m) => m.name.toLowerCase() !== mealToRemove.name.toLowerCase()
        );
        setStepThreeData({ approvedMeals: updatedApproved });
      }

      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  useEffect(() => {
    if (generatedMeals.length > 0 && window.innerWidth < 1024) {
      setIsSidebarOpen(true);
    }
  }, [generatedMeals]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!hasHydrated) {
    return (
      <div className="flex h-full w-full bg-black text-white justify-center items-center">
        <span className="text-gray-400 animate-pulse">
          Loading your data...
        </span>
      </div>
    );
  }

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
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

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
          onUnapprove={unapproveMeal}
          onRemove={removeMeal}
          isMobileVisible={true}
          onCloseMobile={() => {}}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden z-50">
        <MealSidebar
          meals={generatedMeals}
          onApprove={approveMeal}
          onUnapprove={unapproveMeal}
          onRemove={removeMeal}
          isMobileVisible={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
