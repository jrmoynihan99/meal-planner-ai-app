// components/MenuButton.tsx
"use client";

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MenuButton({ isOpen, onClick }: MenuButtonProps) {
  return (
    <button
      className="md:hidden absolute top-4 left-4 z-50 flex flex-col justify-between w-8 h-6 focus:outline-none"
      onClick={onClick}
      aria-label="Toggle menu"
    >
      <span
        className={`h-0.5 w-full bg-red-500 transform transition duration-300 ease-in-out ${
          isOpen ? "rotate-45 translate-y-2" : ""
        }`}
      />
      <span
        className={`h-0.5 w-full bg-red-500 transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`h-0.5 w-full bg-red-500 transform transition duration-300 ease-in-out ${
          isOpen ? "-rotate-45 -translate-y-2" : ""
        }`}
      />
    </button>
  );
}
