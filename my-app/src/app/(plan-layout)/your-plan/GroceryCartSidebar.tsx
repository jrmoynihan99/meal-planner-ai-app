// /components/GroceryCartSidebar.tsx
"use client";

import { useGroceryCart } from "./GroceryCartContext";
import { motion } from "framer-motion";

export function GroceryCartSidebar() {
  const { isOpen, close } = useGroceryCart();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 z-[100] h-full w-[85vw] max-w-sm bg-white text-black shadow-xl p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Grocery List</h2>
        <button onClick={close} className="text-gray-600 hover:text-black">
          ✕
        </button>
      </div>
      <p className="text-sm">Your ingredients will show up here...</p>
    </motion.div>
  );
}
