"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { CloseButton } from "@/components/CloseButton";
import type { Meal } from "@/lib/store";

export default function MealDetailsModal({
  meal,
  onClose,
  initialTab,
}: {
  meal: Meal;
  onClose: () => void;
  initialTab: "ingredients" | "recipe";
}) {
  const [activeTab, setActiveTab] = useState<"ingredients" | "recipe">(
    initialTab
  );

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const mobileControls = useAnimationControls();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile === true) {
      requestAnimationFrame(() => {
        mobileControls.start({ y: "25%" });
      });
    }
  }, [isMobile]);

  function handleClose() {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 200);
  }

  async function handleBackdropClick() {
    if (isMobile) {
      await mobileControls.start({
        y: "100%",
        transition: { type: "tween", ease: "easeIn", duration: 0.25 },
      });
    }
    handleClose();
  }

  if (isMobile === null) return null;

  return (
    <AnimatePresence>
      {!isExiting && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={(e) => {
            e.stopPropagation(); // ✅ prevent bubbling to card
            handleBackdropClick();
          }}
        >
          {isMobile ? (
            <motion.div
              drag="y"
              dragConstraints={{ top: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) handleClose();
              }}
              initial={{ y: "100%" }}
              animate={mobileControls}
              exit={{
                y: "100%",
                transition: { type: "tween", ease: "easeIn", duration: 0.25 },
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 h-[85vh] z-[9999] px-4"
            >
              <div className="relative w-full h-full">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-t-2xl blur-sm opacity-100 transition-all duration-500 ease-in-out" />
                <div
                  className="relative bg-zinc-900 border border-zinc-800 rounded-t-2xl pt-1.5 px-6 pb-6 h-full text-white shadow-xl overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-40 h-1.5 bg-zinc-600 rounded-full mx-auto mt-1 mb-4" />

                  <h2 className="text-lg font-semibold mb-2 font-mono">
                    {meal.name}
                  </h2>

                  <div className="flex items-start gap-4 mb-4">
                    {/* Image */}
                    {meal.imageUrl && (
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="w-28 h-28 rounded-lg object-cover border border-zinc-700"
                      />
                    )}

                    {/* Description */}
                    <p className="text-zinc-400 text-sm font-mono">
                      {meal.description}
                    </p>
                  </div>

                  {/* Tab buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      className={`px-4 py-2 text-sm md:text-xs font-mono border ${
                        activeTab === "ingredients"
                          ? "bg-blue-600 text-white border-blue-500"
                          : "border-zinc-600 text-zinc-400 hover:bg-zinc-700"
                      } rounded transition`}
                      onClick={() => setActiveTab("ingredients")}
                    >
                      Ingredients
                    </button>
                    <button
                      className={`px-4 py-2 text-sm md:text-xs font-mono border ${
                        activeTab === "recipe"
                          ? "bg-blue-600 text-white border-blue-500"
                          : "border-zinc-600 text-zinc-400 hover:bg-zinc-700"
                      } rounded transition`}
                      onClick={() => setActiveTab("recipe")}
                    >
                      Recipe
                    </button>
                  </div>

                  {/* Tab content */}
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    {activeTab === "ingredients" ? (
                      <ul className="text-sm text-zinc-300 space-y-2 list-disc list-inside">
                        {meal.ingredients.map((ingredient, idx) => (
                          <li key={idx}>
                            <span className="font-mono">{ingredient.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ol className="text-sm text-zinc-300 space-y-2 list-decimal list-inside">
                        {meal.recipe.map((step, idx) => (
                          <li key={idx}>
                            <span className="font-mono">{step}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative inline-flex"
            >
              <div className="relative inline-flex group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition-all duration-500 ease-in-out" />
                <div
                  className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-[460px] max-w-full text-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CloseButton
                    onClick={handleClose}
                    className="absolute top-3 right-3"
                  />
                  <h2 className="text-lg font-semibold mb-2 font-mono">
                    {meal.name}
                  </h2>

                  <div className="flex items-start gap-4 mb-4">
                    {/* Image */}
                    {meal.imageUrl && (
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="w-28 h-28 rounded-lg object-cover border border-zinc-700"
                      />
                    )}

                    {/* Description */}
                    <p className="text-zinc-400 text-sm font-mono">
                      {meal.description}
                    </p>
                  </div>

                  {/* Tab buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      className={`px-4 py-2 text-sm md:text-xs font-mono border ${
                        activeTab === "ingredients"
                          ? "bg-blue-600 text-white border-blue-600 cursor-pointer"
                          : "border-zinc-600 text-zinc-400 hover:bg-zinc-700 cursor-pointer"
                      } rounded transition`}
                      onClick={() => setActiveTab("ingredients")}
                    >
                      Ingredients
                    </button>
                    <button
                      className={`px-4 py-2 text-sm md:text-xs font-mono border ${
                        activeTab === "recipe"
                          ? "bg-blue-600 text-white border-blue-600 cursor-pointer"
                          : "border-zinc-600 text-zinc-400 hover:bg-zinc-700 cursor-pointer"
                      } rounded transition`}
                      onClick={() => setActiveTab("recipe")}
                    >
                      Recipe
                    </button>
                  </div>

                  {/* Tab content */}
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    {activeTab === "ingredients" ? (
                      <ul className="text-sm text-zinc-300 space-y-2 list-disc list-inside">
                        {meal.ingredients.map((ingredient, idx) => (
                          <li key={idx}>
                            <span className="font-mono">{ingredient.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ol className="text-sm text-zinc-300 space-y-2 list-decimal list-inside">
                        {meal.recipe.map((step, idx) => (
                          <li key={idx}>
                            <span className="font-mono">{step}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
