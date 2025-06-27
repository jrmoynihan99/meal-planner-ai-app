// components/NextStepButton.tsx
"use client";

interface NextStepButtonProps {
  href: string;
}

export default function NextStepButton({ href }: NextStepButtonProps) {
  return (
    <button
      onClick={() => (window.location.href = href)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-400 font-semibold transition-all shadow-md hover:bg-blue-500 hover:text-white mr-4 cursor-pointer"
    >
      <span>Next</span>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
