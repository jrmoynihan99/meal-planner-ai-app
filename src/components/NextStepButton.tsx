"use client";

interface NextStepButtonProps {
  href: string;
}

export default function NextStepButton({ href }: NextStepButtonProps) {
  return (
    <button
      onClick={() => (window.location.href = href)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500 text-white font-medium bg-blue-600 shadow-md shadow-blue-500/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/40 hover:scale-100 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
    >
      <span className="text-sm">Next</span>
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
