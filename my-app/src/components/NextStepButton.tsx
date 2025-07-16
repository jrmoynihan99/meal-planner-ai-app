"use client";

interface NextStepButtonProps {
  href: string;
}

export default function NextStepButton({ href }: NextStepButtonProps) {
  return (
    <button
      onClick={() => (window.location.href = href)}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-500 text-white font-semibold bg-blue-600 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <span className="text-lg">Next</span>
      <svg
        className="w-5 h-5"
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
