// useMealDrag.ts
import { useEffect, useState } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { TimeUtils } from "./timeUtils";
import type { DayOfWeek, DayPlan } from "@/lib/store";
import { useAppStore } from "@/lib/store";

export function useMealDrag(dayOfWeek: DayOfWeek, meals: DayPlan["meals"]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeMeal, setActiveMeal] = useState<DayPlan["meals"][number] | null>(
    null
  );
  const [scrollOffset, setScrollOffset] = useState(0);

  const stepThreeData = useAppStore((s) => s.stepThreeData);
  const setStepThreeData = useAppStore((s) => s.setStepThreeData);
  const timeUtils = new TimeUtils();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };

    if (activeId) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [activeId]);

  function handleDragStart(event: DragStartEvent) {
    const activeIdStr = event.active.id as string;
    setActiveId(activeIdStr);
    setScrollOffset(window.scrollY);

    const mealId = activeIdStr.split("-")[1];
    const meal = meals.find((m) => m.mealId === mealId);
    if (meal) {
      setActiveMeal(meal);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null);
    setActiveMeal(null);

    if (!over || !stepThreeData) return;

    const activeIdStr = active.id as string;
    const overId = over.id as string;
    if (overId !== `day-${dayOfWeek}`) return;

    const dropContainer = over.rect;
    const dragRect = active.rect.current.translated;
    if (!dropContainer || !dragRect) return;

    const dropY = dragRect.top - dropContainer.top;

    // Convert drop position to time using the same logic as the preview
    // This ensures consistency between preview and actual drop behavior
    const newTime = timeUtils.parseDropPositionToTime(dropY);

    const meal = meals.find((m) => `${dayOfWeek}-${m.mealId}` === activeIdStr);
    if (!meal) return;

    const mealTimeKey = `${dayOfWeek}-${meal.mealId}`;
    const updatedMealTimes = {
      ...stepThreeData.mealTimes,
      [mealTimeKey]: newTime,
    };

    setStepThreeData({ ...stepThreeData, mealTimes: updatedMealTimes });
  }

  return {
    sensors,
    activeId,
    activeMeal,
    scrollOffset,
    handleDragStart,
    handleDragEnd,
  };
}
