// /app/step-one-setup/page.tsx
"use client";

import StepOneForm from "@/components/StepOneForm";

export default function StepOneSetupPage() {
  return (
    <main className="h-full bg-black text-white px-4 py-8">
      <div className="max-w-xl mx-auto">
        <StepOneForm />
      </div>
    </main>
  );
}
