"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import clsx from "clsx";

interface FoodAddCardProps {
  onAdd: (customValue: string) => void;
}

export default function FoodAddCard({ onAdd }: FoodAddCardProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length > 0) {
      onAdd(trimmed);
      setInputValue("");
      setEditing(false);
    }
  };

  const handleClear = () => {
    setInputValue("");
    setEditing(false);
  };

  return (
    <div
      className={clsx(
        "group flex items-center justify-center rounded-xl border border-dashed border-zinc-600 transition-all duration-200 ease-in-out",
        "px-6 py-5 sm:px-7 sm:py-10 bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
      )}
      onClick={() => {
        if (!editing) setEditing(true);
      }}
    >
      {editing ? (
        <div
          className="flex flex-col items-center gap-2 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            autoFocus
            className="w-full px-3 py-2 text-white bg-zinc-900 border border-zinc-600 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add your own..."
          />
          <div className="flex justify-center gap-4 text-xs font-semibold">
            <button
              onClick={handleClear}
              className="text-red-500 hover:underline"
            >
              Clear
            </button>
            <button
              onClick={handleAdd}
              className="text-blue-500 hover:underline"
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-white opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Icon
            icon="mdi:plus"
            className="w-7 h-7 mb-1 transition-colors group-hover:text-white text-zinc-400"
          />
        </div>
      )}
    </div>
  );
}
