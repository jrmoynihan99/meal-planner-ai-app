"use client";

import { useState } from "react";
import FoodToggleCard from "./FoodToggleCard";
import FoodAddCard from "./FoodAddCard"; // NEW

interface FoodToggleGridProps {
  options: string[];
  selected: string[];
  onChange: (newSelected: string[]) => void;
}

const foodIcons: Record<string, string> = {
  chicken: "mdi:food-drumstick-outline",
  beef: "mdi:food-steak",
  turkey: "mdi:turkey",
  salmon: "mdi:fish",
  eggs: "mdi:egg-outline",
  "greek yogurt": "mdi:bowl-outline",
  shrimp: "mdi:shrimp",
  lentils: "mdi:food-outline",
  rice: "mdi:bowl-outline",
  pasta: "mdi:food-variant",
  "sweet potatoes": "mdi:potato",
  quinoa: "mdi:grain",
  oats: "mdi:grain",
  tortillas: "mdi:food-takeout-box-outline",
  bread: "mdi:bread-slice-outline",
  noodles: "mdi:noodles",
  broccoli: "mdi:leaf",
  spinach: "mdi:leaf",
  carrots: "mdi:carrot",
  peppers: "mdi:chili-mild-outline",
  onions: "mdi:food-outline",
  zucchini: "mdi:cucumber",
  "green beans": "mdi:string-lights",
  mushrooms: "mdi:mushroom-outline",
  default: "mdi:food-outline",
};

function getIcon(name: string): string {
  const key = name.toLowerCase().trim();
  return foodIcons[key] || foodIcons["default"];
}

export default function FoodToggleGrid({
  options,
  selected,
  onChange,
}: FoodToggleGridProps) {
  const [customItems, setCustomItems] = useState<string[]>([]);

  const toggle = (item: string) => {
    const isSelected = selected.includes(item);
    const updated = isSelected
      ? selected.filter((s) => s !== item)
      : [...selected, item];
    onChange(updated);
  };

  const handleAddCustom = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (options.includes(trimmed) || customItems.includes(trimmed)) return;
    setCustomItems([...customItems, trimmed]);
    onChange([...selected, trimmed]);
  };

  const allItems = [...options, ...customItems];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 p-1">
      {allItems.map((item) => (
        <FoodToggleCard
          key={item}
          name={item}
          isSelected={selected.includes(item)}
          onClick={() => toggle(item)}
          iconName={getIcon(item) || "mdi:star-outline"}
        />
      ))}

      {/* Add custom item card */}
      <FoodAddCard onAdd={handleAddCustom} />
    </div>
  );
}
