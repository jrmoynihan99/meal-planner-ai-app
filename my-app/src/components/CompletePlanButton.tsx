"use client";

interface CompletePlanButtonProps {
  href: string;
}

export default function CompletePlanButton({ href }: CompletePlanButtonProps) {
  return (
    <button
      onClick={() => (window.location.href = href)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500 bg-black text-blue-400 font-semibold transition-all shadow-md hover:bg-blue-500 hover:text-white mr-4 cursor-pointer"
    >
      <span>Complete</span>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  );
}
