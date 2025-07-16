// DroppableArea.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import { TimeUtils } from "./timeUtils";
import { CalendarStyles } from "./calendarStyles";
import type { DayOfWeek } from "@/lib/store";

interface DroppableAreaProps {
  dayOfWeek: DayOfWeek;
  children: React.ReactNode;
}

export default function DroppableArea({
  dayOfWeek,
  children,
}: DroppableAreaProps) {
  const [dropY, setDropY] = useState<number | null>(null);
  const timeUtils = new TimeUtils();
  const styles = new CalendarStyles();

  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dayOfWeek}`,
    data: { dayOfWeek },
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isOver) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    // The drop handler calculates position based on the top of the dragged card.
    // We need to estimate where the card's top would be relative to the mouse.
    // This offset should match how far the mouse is from the card's top edge when dragging starts.
    const CARD_HEIGHT = 50; // Approximate height of your meal card
    const MOUSE_TO_CARD_TOP_OFFSET = CARD_HEIGHT / 2; // Assume mouse grabs middle of card

    const estimatedCardTop = mouseY - MOUSE_TO_CARD_TOP_OFFSET;

    setDropY(estimatedCardTop);
  };

  const handleMouseLeave = () => setDropY(null);

  const getDropPreviewPosition = (yPos: number) => {
    return timeUtils.getDropPreviewPosition(yPos);
  };

  return (
    <div
      ref={setNodeRef}
      className="relative"
      style={styles.getContainerStyle()}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {isOver && dropY !== null && (
        <div
          className="absolute left-2 right-2 bg-blue-400 rounded-xl opacity-40 z-20 pointer-events-none"
          style={{
            top: getDropPreviewPosition(dropY),
            ...styles.getDropPreviewStyle(),
          }}
        />
      )}
      {children}
    </div>
  );
}
