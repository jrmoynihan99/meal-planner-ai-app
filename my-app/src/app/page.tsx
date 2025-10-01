"use client";

import { Typewriter } from "@/components/Typewriter";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GlowingButton } from "@/components/GlowingButton";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  return (
    <main className="bg-zinc-900 text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 sm:px-6 py-12 sm:py-20">
        <div className="w-full max-w-xl sm:max-w-2xl text-center space-y-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold font-sans leading-tight">
              <span className="block sm:inline">Get Your Free</span>{" "}
              <span className="block sm:inline italic">Personalized</span>{" "}
              <span className="block sm:inline">Meal Plan to...</span>
            </h1>
            <div className="mt-2">
              <Typewriter
                texts={[
                  "Guarantee Results",
                  "Optimize Health",
                  "Automate Eating",
                ]}
                typingSpeed={40}
                deletingSpeed={25}
                delayBetween={1000}
                fontClass="font-sans font-bold"
                sizeClass="text-4xl sm:text-5xl"
                colorClass="glow-gradient"
              />
            </div>
          </div>

          <p className="text-center text-zinc-400 text-sm sm:text-base max-w-xl mx-auto px-6 sm:px-0 mt-2">
            A done-for-you plan that tells you exactly what to eat, how much,
            and when—
            <span className="text-zinc-200 font-semibold">
              without tracking a single thing
            </span>
            .
          </p>

          <div className="flex justify-center mt-6">
            <GlowingButton
              text="Get Started"
              loading={isLoading}
              onClick={() => {
                setIsLoading(true);
                router.push("/step-one-data");
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
