"use client";

import { useState } from "react";
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

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Mobile sidebar tab (grab handle) */}
      <div
        className="lg:hidden fixed top-1/2 right-0 transform -translate-y-1/2 z-40"
        onClick={() => setIsSidebarOpen(true)}
      >
        <div className="bg-zinc-800 hover:bg-zinc-700 w-3 h-16 rounded-l-full cursor-pointer flex items-center justify-center">
          <div className="w-1 h-10 bg-white rounded-full" />
        </div>
      </div>

      {/* Main content area */}
      <motion.div
        className="flex flex-col flex-1 min-w-0"
        animate={{
          x: isSidebarOpen ? -240 : 0, // shift left when mobile sidebar opens
          scale: isSidebarOpen ? 0.95 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ originX: 1 }} // scale inward from right edge
      >
        <main className="flex-1 p-4 max-w-2xl mx-auto pb-36">
          <MessageList
            messages={messages}
            streamingMessage={streamingMessage}
            isLoading={isLoading}
          />
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
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-[320px] flex-shrink-0 border-l border-gray-800 bg-[#111] flex-col">
        <MealSidebar
          meals={generatedMeals}
          onApprove={approveMeal}
          onTweak={(index) => {}}
          onReplace={(index) => {}}
          isMobileVisible={true} // always visible on desktop
          onCloseMobile={() => {}} // no-op on desktop
        />
      </div>

      {isSidebarOpen && (
        <motion.div
          className="lg:hidden fixed inset-0 bg-black z-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      {/* Mobile sidebar (slide-in) */}
      <div className="lg:hidden">
        <MealSidebar
          meals={generatedMeals}
          onApprove={approveMeal}
          onTweak={(index) => {}}
          onReplace={(index) => {}}
          isMobileVisible={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
