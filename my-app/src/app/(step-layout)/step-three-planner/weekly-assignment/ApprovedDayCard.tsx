// ApprovedDayCard.tsx
"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface ApprovedDayCardProps {
  id: string;
  title: string;
  calories: number;
  protein: number;
}

export default function ApprovedDayCard({
  id,
  title,
  calories,
  protein,
}: ApprovedDayCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="min-w-[160px] bg-zinc-800 rounded-lg p-3 text-sm shadow-md border border-zinc-700 cursor-grab select-none"
    >
      <div className="font-semibold text-white mb-1 truncate">{title}</div>
      <div className="text-zinc-400">
        {calories} kcal &bull; {protein}g protein
      </div>
    </div>
  );
}
