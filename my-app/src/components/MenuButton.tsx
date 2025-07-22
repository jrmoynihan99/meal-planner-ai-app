"use client";

import { useSidebar } from "./SidebarContext"; // ✅ use context now

interface MenuButtonProps {
  ariaLabel?: string;
}

export function MenuButton({ ariaLabel = "Menu" }: MenuButtonProps) {
  const { isOpen, toggle } = useSidebar(); // ✅ pull from context

  return (
    <button
      aria-label={ariaLabel}
      onClick={toggle} // ✅ call context toggle
      className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
    >
      <div className="relative w-5 h-5">
        {/* Top line (white) */}
        <span
          className={`absolute left-0 h-[1.5px] rounded-sm bg-white transition-all duration-300 ease-in-out origin-center
            ${
              isOpen
                ? "top-1/2 w-4 -translate-y-1/2 rotate-45"
                : "top-[30%] w-5 translate-y-0 rotate-0"
            }
          `}
        />

        {/* Bottom line (blue) */}
        <span
          className={`absolute left-0 h-[1.5px] rounded-sm bg-blue-500 transition-all duration-300 ease-in-out origin-center
            ${
              isOpen
                ? "top-1/2 w-4 -translate-y-1/2 -rotate-45"
                : "top-[65%] w-3 translate-y-0 rotate-0"
            }
          `}
        />
      </div>
    </button>
  );
}
