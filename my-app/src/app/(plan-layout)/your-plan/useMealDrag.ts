// useMealDrag.ts
import { useState, useCallback } from "react";
import {
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import type { DayOfWeek, DayPlan } from "@/lib/store";

interface MealWithDay {
  meal: DayPlan["meals"][number];
  day: DayOfWeek;
}

export function useMealDrag(mealsWithDays: MealWithDay[]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeMeal, setActiveMeal] = useState<DayPlan["meals"][number] | null>(
    null
  );
  const [activeDayOfWeek, setActiveDayOfWeek] = useState<DayOfWeek | null>(
    null
  );
  const [scrollOffset, setScrollOffset] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeIdStr = active.id as string;

      // Find the meal and day from the flattened array
      const mealWithDay = mealsWithDays.find(
        ({ meal, day }) => `${day}-${meal.mealId}` === activeIdStr
      );

      if (mealWithDay) {
        setActiveId(activeIdStr);
        setActiveMeal(mealWithDay.meal);
        setActiveDayOfWeek(mealWithDay.day);

        // Capture scroll offset for drag overlay positioning
        setScrollOffset(window.scrollY);
      }
    },
    [mealsWithDays]
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Handle the drop logic here
      // You'll need to implement the actual meal moving logic
      console.log("Move meal from", active.id, "to", over.id);
    }

    // Reset drag state
    setActiveId(null);
    setActiveMeal(null);
    setActiveDayOfWeek(null);
    setScrollOffset(0);
  }, []);

  return {
    sensors,
    activeId,
    activeMeal,
    activeDayOfWeek,
    scrollOffset,
    handleDragStart,
    handleDragEnd,
  };
}
