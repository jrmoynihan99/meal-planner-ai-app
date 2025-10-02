"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { CloseButton } from "@/components/CloseButton";
import type { DayPlan } from "@/lib/store";

interface ThreeTabMealModalProps {
  scaledMeal: DayPlan["meals"][number];
  isOpen: boolean;
  initialTab?: "ingredients" | "recipe";
  onClose: () => void;
}

export function ThreeTabMealModal({
  scaledMeal,
  isOpen,
  initialTab = "ingredients",
  onClose,
}: ThreeTabMealModalProps) {
  const [activeTab, setActiveTab] = useState<"ingredients" | "recipe">(
    initialTab
  );
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const mobileControls = useAnimationControls();
  const modalRef = useRef<HTMLDivElement>(null);

  // Dismiss on outside click (desktop)
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen && isMobile === false) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [onClose, isOpen, isMobile]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
      setIsExiting(false);
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

  if (!isOpen || isMobile === null) return null;

  // ----- Use meal color for the glow -----
  const mealColor = scaledMeal.color || "#4F81BD";
  // If you want a soft pastel, you could process it, but usually a color string is fine.

  // Top section: image left, text right
  // Top section with just text color on cals/protein
  function TopSection() {
    return (
      <div className="flex items-start gap-4 mb-4">
        {scaledMeal.imageUrl ? (
          <img
            src={scaledMeal.imageUrl}
            alt={scaledMeal.mealName}
            className="w-24 h-24 rounded-lg object-cover border border-zinc-700 flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 text-xs font-mono flex-shrink-0">
            No image
          </div>
        )}
        <div className="flex-1 min-w-0">
          {scaledMeal.mealDescription && (
            <p className="text-zinc-400 text-sm leading-relaxed mb-2 break-words">
              {scaledMeal.mealDescription}
            </p>
          )}
          <div className="flex gap-8">
            <div>
              <div className="text-zinc-400 text-xs uppercase mb-1">
                Calories
              </div>
              <code
                className="bg-zinc-800 px-2 py-1 rounded-md block w-fit"
                style={{
                  color: mealColor,
                }}
              >
                {scaledMeal.totalCalories.toFixed(0)} kcal
              </code>
            </div>
            <div>
              <div className="text-zinc-400 text-xs uppercase mb-1">
                Protein
              </div>
              <code
                className="bg-zinc-800 px-2 py-1 rounded-md block w-fit"
                style={{
                  color: mealColor,
                }}
              >
                {scaledMeal.totalProtein.toFixed(1)} g
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={(e) => {
            e.stopPropagation();
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
                {/* BLUR GLOW using meal color */}
                {/*<div
                  className="absolute -inset-[1px] rounded-t-2xl blur-[16px] opacity-100 transition-all duration-500 ease-in-out"
                  style={{
                    background: mealColor,
                    boxShadow: `0 0 5px 5px ${mealColor}`,
                  }}
                />*/}
                <div
                  ref={modalRef}
                  className="relative bg-zinc-900 border border-zinc-800 rounded-t-2xl pt-1.5 px-6 pb-6 h-full text-white shadow-xl overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-40 h-1.5 bg-zinc-600 rounded-full mx-auto mt-1 mb-4" />
                  <h2 className="text-lg font-semibold mb-2 font-mono">
                    {scaledMeal.mealName}
                  </h2>
                  <TopSection />

                  {/* Tab bar: Only Ingredients & Recipe */}
                  <div className="flex gap-2 mb-4">
                    <button
                      className={`px-4 py-2 text-sm md:text-xs font-mono border rounded transition ${
                        activeTab === "ingredients"
                          ? ""
                          : "border-zinc-600 text-zinc-400 hover:bg-zinc-700 cursor-pointer"
                      }`}
                      style={
                        activeTab === "ingredients"
                          ? {
                              background: mealColor,
                              color: "#fff",
                              borderColor: mealColor,
                            }
                          : {
                              color: mealColor,
                            }
                      }
                      onClick={() => setActiveTab("ingredients")}
                    >
                      Ingredients
                    </button>
                    <button
                      className={`px-4 py-2 text-sm md:text-xs font-mono border rounded transition ${
                        activeTab === "recipe"
                          ? ""
                          : "border-zinc-600 text-zinc-400 hover:bg-zinc-700 cursor-pointer"
                      }`}
                      style={
                        activeTab === "recipe"
                          ? {
                              background: mealColor,
                              color: "#fff",
                              borderColor: mealColor,
                            }
                          : {
                              color: mealColor,
                            }
                      }
                      onClick={() => setActiveTab("recipe")}
                    >
                      Recipe
                    </button>
                  </div>

                  {/* Tab content */}
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-2">
                    {activeTab === "ingredients" && (
                      <div className="text-sm text-zinc-300 max-h-[260px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="text-zinc-400 border-b border-zinc-700">
                              <th className="py-1 pr-2">Ingredient</th>
                              <th className="py-1 pr-2">Amount</th>
                              <th className="py-1 pr-2">Protein</th>
                              <th className="py-1">Calories</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scaledMeal.ingredients.map((ing, i) => (
                              <tr key={i} className="border-b border-zinc-800">
                                <td className="py-1 pr-2 text-white">
                                  {ing.name}
                                </td>
                                <td className="py-1 pr-2">
                                  {ing.amount ?? `${ing.grams}g`}
                                </td>
                                <td className="py-1 pr-2">
                                  {ing.protein?.toFixed(1) ?? "-"}
                                </td>
                                <td className="py-1">
                                  {ing.calories?.toFixed(0) ?? "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === "recipe" && (
                      <ol className="bg-zinc-800 p-2 rounded-md text-sm text-zinc-100 max-h-[180px] overflow-y-auto border border-zinc-700 list-decimal list-inside space-y-2">
                        {(scaledMeal.recipe.length > 0
                          ? scaledMeal.recipe
                          : ["No recipe provided."]
                        ).map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // Desktop variant
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative inline-flex"
            >
              <div className="relative inline-flex group">
                {/* BLUR GLOW using meal color */}
                {/*<div
                  className="absolute -inset-[1px] rounded-xl blur-[16px] opacity-100 group-hover:opacity-100 transition-all duration-500 ease-in-out"
                  style={{
                    background: mealColor,
                    boxShadow: `0 0 5px 5px ${mealColor}`,
                  }}
                />*/}
                <div
                  ref={modalRef}
                  className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-[460px] max-w-full text-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CloseButton
                    onClick={handleClose}
                    className="absolute top-3 right-3"
                  />
                  <h2 className="text-lg font-semibold mb-2 font-mono">
                    {scaledMeal.mealName}
                  </h2>
                  <TopSection />

                  {/* Tab bar: Only Ingredients & Recipe */}
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
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-2">
                    {activeTab === "ingredients" && (
                      <div className="text-sm text-zinc-300 max-h-[260px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="text-zinc-400 border-b border-zinc-700">
                              <th className="py-1 pr-2">Ingredient</th>
                              <th className="py-1 pr-2">Amount</th>
                              <th className="py-1 pr-2">Protein</th>
                              <th className="py-1">Calories</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scaledMeal.ingredients.map((ing, i) => (
                              <tr key={i} className="border-b border-zinc-800">
                                <td className="py-1 pr-2 text-white">
                                  {ing.name}
                                </td>
                                <td className="py-1 pr-2">
                                  {ing.amount ?? `${ing.grams}g`}
                                </td>
                                <td className="py-1 pr-2">
                                  {ing.protein?.toFixed(1) ?? "-"}
                                </td>
                                <td className="py-1">
                                  {ing.calories?.toFixed(0) ?? "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === "recipe" && (
                      <ol className="bg-zinc-800 p-2 rounded-md text-sm text-zinc-100 max-h-[180px] overflow-y-auto border border-zinc-700 list-decimal list-inside space-y-2">
                        {(scaledMeal.recipe.length > 0
                          ? scaledMeal.recipe
                          : ["No recipe provided."]
                        ).map((step, idx) => (
                          <li key={idx}>{step}</li>
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
