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

      {/* How It Works Section */}
      <section className="w-full max-w-3xl mx-auto py-16 px-6 text-center">
        <h2 className="flex items-center justify-center gap-3 text-2xl font-sans sm:text-3xl font-semibold mb-8">
          How It Works
          <ChevronDown className="h-5 w-5 text-zinc-500 animate-bounce" />
        </h2>

        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-y-10 sm:gap-10 text-left place-items-center">
          {[
            {
              step: 1,
              title: "Find Your Targets",
              desc: "Tell us your fitness goals and enter some basic data. We'll generate your daily calorie and protein targets",
              punch: "Get this right, guarantee results",
              footer: "~3 mins to complete",
            },
            {
              step: 2,
              title: "Make Your Meals",
              desc: "Tell us what kinds of foods you like, and we'll generate tons of recipes, and portion them out to hit your targets",
              punch: "Fully flexible",
              footer: "~10 min to complete",
            },
            {
              step: 3,
              title: "Get Your Plan",
              desc: "Your week of auto-built—meals, portions, recipes, and weekly shopping list done for you.",
              punch: "No tracking needed",
              footer: "Instant, fully automated",
            },
          ].map((stepData) => (
            <div
              key={stepData.step}
              className="relative group transition-transform duration-300 hover:scale-[1.02] aspect-square w-full max-w-[300px] mx-auto sm:max-w-none"
            >
              {/* Glow border */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-sm opacity-40 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

              {/* Card content */}
              <div className="relative bg-zinc-900 text-white rounded-xl p-4 sm:p-5 border border-zinc-800 shadow-xl h-full flex flex-col justify-between">
                <div>
                  {/* Step Badge */}
                  <div className="mb-2">
                    <span className="inline-block text-xs font-medium tracking-wide px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                      STEP {stepData.step}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2">
                    {stepData.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-zinc-400 leading-snug">
                    {stepData.desc}
                  </p>

                  {/* Punchline */}
                  <p className="text-xs font-mono text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 inline-block mt-3">
                    {stepData.punch}
                  </p>
                </div>

                {/* Time Estimate (Bottom Left) */}
                <p className="absolute bottom-4 left-4 text-xs text-zinc-500">
                  {stepData.footer}
                </p>

                {/* Arrow icon (Bottom Right) */}
                <div className="absolute bottom-4 right-4">
                  <Link
                    href="/step-two-planner"
                    className="inline-flex items-center justify-center rounded-full p-2 hover:bg-zinc-800 transition border border-zinc-700"
                  >
                    <ArrowRight className="h-5 w-5 text-zinc-400 hover:text-white transition" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why This Is Different Section */}
      <section className="w-full max-w-3xl mx-auto py-16 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
          Why This Is Different
        </h2>
        <p className="text-zinc-400 text-base mb-8">
          Most plans ask you to track every bite. This one eliminates the
          work—so you can stay consistent without obsessing.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 text-left">
          <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700">
            <h3 className="font-semibold mb-1">🚫 No Tracking</h3>
            <p className="text-zinc-400">
              You never have to log calories or protein. The system does it for
              you in advance.
            </p>
          </div>
          <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700">
            <h3 className="font-semibold mb-1">🧠 No Decisions</h3>
            <p className="text-zinc-400">
              Every meal and portion is already chosen. Just follow the plan, no
              thinking required.
            </p>
          </div>
          <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700">
            <h3 className="font-semibold mb-1">📅 No Overwhelm</h3>
            <p className="text-zinc-400">
              You get a ready-made structure for the entire week, tailored to
              your goals.
            </p>
          </div>
          <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700">
            <h3 className="font-semibold mb-1">🧾 No Confusion</h3>
            <p className="text-zinc-400">
              Each day is laid out with exact meals, portions, and timing. Just
              follow it.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
