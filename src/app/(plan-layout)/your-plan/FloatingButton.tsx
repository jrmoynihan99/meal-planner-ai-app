// components/FloatingButton.tsx
import { motion } from "framer-motion";
import clsx from "clsx";

interface FloatingButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

export function FloatingButton({
  icon,
  onClick,
  ariaLabel,
  className = "",
}: FloatingButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={ariaLabel}
      className={clsx(
        // Only core button sizing/layout here
        "w-14 h-14 rounded-full flex items-center justify-center text-2xl",
        "transition-all duration-150",
        className
      )}
    >
      {icon}
    </motion.button>
  );
}
