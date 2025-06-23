"use client";

import clsx from "clsx";

interface GoalPaceBadgeProps {
  title: string;
}

export function GoalPaceBadge({ title }: GoalPaceBadgeProps) {
  const pace =
    title.includes("Fast") && title.includes("Loss")
      ? "-2lb/week"
      : title.includes("Moderate") && title.includes("Loss")
      ? "-1lb/week"
      : title.includes("Fast") && title.includes("Gain")
      ? "+2lb/week"
      : title.includes("Moderate") && title.includes("Gain")
      ? "+1lb/week"
      : "--";

  const colorClass =
    title.includes("Fast") && (title.includes("Loss") || title.includes("Gain"))
      ? "text-red-400"
      : title.includes("Moderate")
      ? "text-amber-400"
      : "text-zinc-400";

  return (
    <span
      className={clsx(
        "text-xs font-medium rounded-md px-2 py-0.5 bg-zinc-800 border border-zinc-600",
        colorClass
      )}
    >
      {pace}
    </span>
  );
}
