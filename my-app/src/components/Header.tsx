"use client";

import { usePathname } from "next/navigation";

const routeTitles: Record<string, string> = {
  "/step-one-data": "Input Your Data",
  "/step-two-goal": "Choose Your Goal",
  "/step-three-planner": "Build Your Meals",
  "/step-four-results": "Your Plan",
};

export function Header() {
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Step";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-black px-4 sm:px-8">
      <div className="text-base sm:text-lg font-semibold text-white text-center flex-1">
        {title}
      </div>
    </header>
  );
}
