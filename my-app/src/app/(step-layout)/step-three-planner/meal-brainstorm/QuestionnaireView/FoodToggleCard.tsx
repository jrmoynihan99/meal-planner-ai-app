"use client";

import { Icon } from "@iconify/react";
import clsx from "clsx";

interface FoodToggleCardProps {
  name: string;
  isSelected: boolean;
  onClick: () => void;
  iconName: string;
}

export default function FoodToggleCard({
  name,
  isSelected,
  onClick,
  iconName,
}: FoodToggleCardProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center justify-center gap-3 rounded-xl border transition-all duration-200 ease-in-out",
        "px-6 py-5 sm:px-7 sm:py-10 cursor-pointer", // generous padding for card feel
        isSelected
          ? "bg-blue-500/10 border-blue-500 ring-2 ring-blue-500"
          : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
      )}
    >
      <div
        className={clsx(
          "flex items-center gap-2 transform transition-transform duration-200 ease-in-out",
          isSelected ? "scale-95" : "scale-100"
        )}
      >
        <Icon
          icon={iconName}
          className="w-6 h-6 sm:w-7 sm:h-7 text-white opacity-90"
        />
        <span className="text-sm sm:text-base font-medium capitalize tracking-wide text-white opacity-90">
          {name}
        </span>
      </div>
    </button>
  );
}
