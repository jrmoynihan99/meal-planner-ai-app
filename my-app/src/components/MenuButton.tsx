"use client";

interface MenuButtonProps {
  onClick?: () => void;
  ariaLabel?: string;
}

export function MenuButton({ onClick, ariaLabel = "Menu" }: MenuButtonProps) {
  return (
    <div
      className="group flex h-10 w-10 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-2xl bg-white p-2 hover:bg-slate-200"
      role="button"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <div className="space-y-2">
        <span className="block h-1 w-6 sm:w-8 origin-center rounded-full bg-slate-500 transition-transform ease-in-out group-hover:translate-y-1.5 group-hover:rotate-45"></span>
        <span className="block h-1 w-5 sm:w-6 origin-center rounded-full bg-orange-500 transition-transform ease-in-out group-hover:w-8 group-hover:-translate-y-1.5 group-hover:-rotate-45"></span>
      </div>
    </div>
  );
}
