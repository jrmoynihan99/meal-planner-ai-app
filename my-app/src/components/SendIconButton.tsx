// components/SendIconButton.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowUpIcon } from "@heroicons/react/24/solid";

interface SendIconButtonProps {
  isAnimating: boolean;
  onClick: (e: React.MouseEvent) => void;
  colorClass?: string; // Optional color override
}

export function SendIconButton({
  isAnimating,
  onClick,
  colorClass = "text-blue-400 hover:text-blue-600",
}: SendIconButtonProps) {
  const arrow = (
    <ArrowUpIcon className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />
  );

  return (
    <div className="relative h-4 w-4" onClick={onClick}>
      {!isAnimating && (
        <motion.div
          initial={{ scale: 1, y: 0, opacity: 1 }}
          className="cursor-pointer absolute inset-0 flex items-center justify-center"
        >
          {arrow}
        </motion.div>
      )}

      {isAnimating && (
        <>
          {/* Arrow launching up */}
          <motion.div
            initial={{ scale: 1, y: 0, opacity: 1 }}
            animate={{
              scale: [1, 0.7, 0.7],
              y: [0, 2, -32],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.5,
              times: [0, 0.3, 1],
              ease: "easeInOut",
            }}
            className="cursor-pointer absolute inset-0 flex items-center justify-center"
          >
            {arrow}
          </motion.div>

          {/* Arrow reappearing from below */}
          <motion.div
            initial={{ y: 32, opacity: 0, scale: 1 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
            className="cursor-pointer absolute inset-0 flex items-center justify-center"
          >
            {arrow}
          </motion.div>
        </>
      )}
    </div>
  );
}
