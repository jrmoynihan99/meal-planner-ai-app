"use client";

import { usePathname } from "next/navigation";

const routeTitles: Record<string, string> = {
  "/step-one-setup": "Setup",
  "/step-two-planner": "Planner",
  "/step-three-schedule": "Schedule",
};

export function Header() {
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Step";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 sm:px-8">
      {/* Center: Step Title */}
      <div className="text-base sm:text-lg font-semibold text-white text-center flex-1">
        {title}
      </div>

      {/* Right: Step-Specific Action */}
      <div className="w-24 text-right">
        {pathname === "/step-one-setup" && (
          <button className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white transition">
            Save
          </button>
        )}
        {pathname === "/step-two-planner" && (
          <button className="px-3 py-1 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white transition">
            Regenerate
          </button>
        )}
        {pathname === "/step-three-schedule" && (
          <button className="px-3 py-1 text-sm rounded-md bg-purple-600 hover:bg-purple-700 text-white transition">
            Export
          </button>
        )}
      </div>
    </header>
  );
}
