"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import clsx from "clsx";
import { GeneralInfoOverlay } from "@/components/GeneralInfoOverlay";
import { useAppStore } from "@/lib/store";

const activityOptions = [
  {
    label: "Sedentary",
    description: "Little or no exercise",
    multiplier: 1.2,
  },
  {
    label: "Lightly Active",
    description: "Light exercise/sports 1–3 days/week",
    multiplier: 1.375,
  },
  {
    label: "Moderately Active",
    description: "Moderate exercise 3–5 days/week",
    multiplier: 1.55,
  },
  {
    label: "Very Active",
    description: "Hard exercise 6–7 days/week",
    multiplier: 1.725,
  },
  {
    label: "Extremely Active",
    description: "Hard daily exercise & physical job",
    multiplier: 1.9,
  },
];

function calculateTargets(
  sex: string,
  age: number,
  heightInches: number,
  weight: number,
  multiplier: number
) {
  const heightCm = heightInches * 2.54;
  const weightKg = weight * 0.4536;
  const bmr =
    sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const calories = Math.round(bmr * multiplier);
  const protein = Math.round(weight * 0.9);

  return { calories, protein };
}

export default function StepOneSetupPage() {
  const stepOneData = useAppStore((s) => s.stepOneData);
  const setStepOneData = useAppStore((s) => s.setStepOneData);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  console.log("✅ Hydrated:", hasHydrated);
  console.log("📦 Zustand stepOneData:", stepOneData);

  const [sex, setSex] = useState<"male" | "female" | "">("");
  const [age, setAge] = useState(25);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(10);
  const [weight, setWeight] = useState(170);
  const [activity, setActivity] = useState(activityOptions[2]);

  const [showActivityInfo, setShowActivityInfo] = useState(false);
  const [showCalorieCalcInfo, setShowCalorieCalcInfo] = useState(false);
  const [showStepInfo, setShowStepInfo] = useState(false);

  // Populate initial state from Zustand after hydration
  useEffect(() => {
    if (hasHydrated && stepOneData) {
      setSex(stepOneData.sex ?? "");
      setAge(stepOneData.age ?? 25);
      setHeightFt(stepOneData.heightFt ?? 5);
      setHeightIn(stepOneData.heightIn ?? 10);
      setWeight(stepOneData.weight ?? 170);
      setActivity(stepOneData.activity ?? activityOptions[2]);
    }
  }, [hasHydrated]);

  // Sync live changes back to Zustand
  useEffect(() => {
    if (!hasHydrated) return; // wait until localStorage is loaded

    const heightInches = heightFt * 12 + heightIn;
    const targets = calculateTargets(
      sex,
      age,
      heightInches,
      weight,
      activity.multiplier
    );

    setStepOneData({
      sex,
      age,
      heightFt,
      heightIn,
      weight,
      activity,
      calorieTarget: targets.calories,
      proteinTarget: targets.protein,
    });
  }, [sex, age, heightFt, heightIn, weight, activity, hasHydrated]);

  if (!hasHydrated) return null; // Don't render until Zustand is ready

  const heightInches = heightFt * 12 + heightIn;
  const targets = calculateTargets(
    sex,
    age,
    heightInches,
    weight,
    activity.multiplier
  );

  const isFormComplete = sex && age > 0 && heightFt > 0 && weight > 0;

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <main className="h-full bg-black text-white px-4 py-8">
        <div className="max-w-xl mx-auto">
          <Box className="text-white pt-0 pr-6 pb-6 pl-6 space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <h1 className="text-2xl font-medium tracking-tight text-white/90">
                Input Your Data
              </h1>
              <InfoOutlinedIcon
                fontSize="small"
                className="text-zinc-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => setShowStepInfo(true)}
              />
            </div>

            {/* Sex Toggle Pills */}
            <div>
              <label className="block text-sm mb-2">Sex</label>
              <div className="flex gap-3">
                {["male", "female"].map((option) => {
                  const isSelected = sex === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSex(option as "male" | "female")}
                      className={clsx(
                        "px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wide border transition cursor-pointer",
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm mb-1">
                Age:{" "}
                <span className="text-indigo-400 font-semibold">{age}</span>
              </label>
              <Slider
                value={age}
                onChange={(_, val) => setAge(val as number)}
                min={10}
                max={100}
                step={1}
                sx={{ color: "#6366f1" }}
              />
            </div>

            {/* Height */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-2">
                  Height (feet):{" "}
                  <span className="text-indigo-400 font-semibold">
                    {heightFt}
                  </span>
                </label>
                <Slider
                  value={heightFt}
                  onChange={(_, val) => setHeightFt(val as number)}
                  min={3}
                  max={7}
                  step={1}
                  sx={{ color: "#6366f1" }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-2">
                  Height (inches):{" "}
                  <span className="text-indigo-400 font-semibold">
                    {heightIn}
                  </span>
                </label>
                <Slider
                  value={heightIn}
                  onChange={(_, val) => setHeightIn(val as number)}
                  min={0}
                  max={11}
                  step={1}
                  sx={{ color: "#6366f1" }}
                />
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm mb-1">
                Weight (lb):{" "}
                <span className="text-indigo-400 font-semibold">{weight}</span>
              </label>
              <Slider
                value={weight}
                onChange={(_, val) => setWeight(val as number)}
                min={80}
                max={350}
                step={1}
                sx={{ color: "#6366f1" }}
              />
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-sm mb-1 flex items-center gap-1">
                Activity Level
                <span title="Learn more">
                  <InfoOutlinedIcon
                    fontSize="small"
                    className="text-zinc-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => setShowActivityInfo(true)}
                  />
                </span>
              </label>
              <Select
                fullWidth
                value={activity.label}
                onChange={(e) => {
                  const selected = activityOptions.find(
                    (opt) => opt.label === e.target.value
                  );
                  if (selected) setActivity(selected);
                }}
                sx={{
                  backgroundColor: "#1f2937",
                  borderColor: "#374151",
                  color: "white",
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4b5563",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6366f1",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6366f1",
                  },
                  ".MuiSvgIcon-root": {
                    color: "#9ca3af",
                  },
                }}
              >
                {activityOptions.map((option) => (
                  <MenuItem key={option.label} value={option.label}>
                    <Box>
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-xs text-zinc-500">
                        {option.description}
                      </div>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </div>
          </Box>
        </div>
      </main>

      {/* Sticky Footer */}
      {targets && (
        <div className="sticky bottom-0 z-50 bg-zinc-900/95 border-t border-zinc-700 backdrop-blur-md">
          <div className="w-full px-4 md:px-8 py-4 text-white text-sm font-mono flex items-center justify-between">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 uppercase text-xs tracking-wider text-zinc-400 mb-1">
                <span>Calculated Maintenance Calories</span>
                <InfoOutlinedIcon
                  fontSize="small"
                  className="cursor-pointer hover:text-white transition-colors"
                  onClick={() => setShowCalorieCalcInfo(true)}
                />
              </div>
              <span className="inline-block bg-zinc-800 px-3 py-1.5 rounded-md text-blue-400 text-base">
                {targets.calories.toLocaleString()} kcal
              </span>
            </div>

            {isFormComplete && (
              <button
                onClick={() => (window.location.href = "/step-one-setup/next")}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overlays */}
      {showActivityInfo && (
        <GeneralInfoOverlay
          onClose={() => setShowActivityInfo(false)}
          subheading="Activity Level Info"
          title="How To Choose Activity Level"
          description="Not all exercise is created equal. Cardiovascular training (like running) burns more calories than lifting weights."
          example={`• For weight training only, assume a lower activity level \n• Distance runner, assume more`}
        />
      )}
      {showStepInfo && (
        <GeneralInfoOverlay
          onClose={() => setShowStepInfo(false)}
          subheading="Help"
          title="What's This Step For?"
          description="We'll collect your info here to calculate your maintenance calories. In the next step, we'll identify your goals and generate your personalized daily targets before moving on to your meal plan!"
        />
      )}
      {showCalorieCalcInfo && (
        <GeneralInfoOverlay
          onClose={() => setShowCalorieCalcInfo(false)}
          subheading="Maintenance Calories"
          title="How Is This Calculated?"
          description="We use the Mifflin-St Jeor Equation, one of the most trusted formulas for calculating Basal Metabolic Rate (BMR).

Your BMR is how many calories your body burns at rest. We then multiply that number by an activity factor based on your lifestyle to estimate your maintenance calories — the amount you need to eat each day to maintain your current weight."
        />
      )}
    </div>
  );
}
