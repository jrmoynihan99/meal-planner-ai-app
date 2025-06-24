// lib/phaseSuggestions.ts

import type { Phase } from "./store";

export const suggestionsByPhase: Record<Phase, string[]> = {
  intro: ["Let's begin!", "How does this work?"],
  ingredients: ["Animal Based", "Vegetarian", "Low-carb"],
  ingredients_confirmation: ["Looks good", "Remove eggs", "Add more fruits"],
  meal_number: ["2 meals", "3 meals", "4 meals"],
  meal_tweaking: ["Add variety", "Remove remove meals", "Swap carbs"],
  example_day: ["Swap carbs"],
  day_tweaking: ["Change breakfast", "Make lunch higher protein"],
  weekly_assignment: ["Skip Sunday", "Assign randomly"],
  conclusion: ["Show summary"],
};

export const descriptions: Record<string, string> = {
  "Let's begin!": "Kick off the meal planning process.",
  "How does this work?": "Learn how to interact with the planner.",
  "Animal Based": "Meat, dairy, fruit, and honey only.",
  Vegetarian: "No meat or fish; plant-based only.",
  "Low-carb": "Avoid rice, bread, pasta, and other starch-heavy foods.",
  "Looks good": "Approve the current ingredient list.",
  "Remove eggs": "Exclude eggs from your plan.",
  "Add more fruits": "Include a greater variety of fruits.",
  "2 meals": "Plan for 2 meals per day.",
  "3 meals": "Plan for 3 meals per day.",
  "4 meals": "Plan for 4 meals per day.",
  "Add variety": "Rotate ingredients and meal types for diversity.",
  "Remove remove meals": "Exclude meals you don’t like or want.",
  "Swap carbs": "Replace simple carbs with complex alternatives.",
  "Change breakfast": "Modify your breakfast meal.",
  "Make lunch higher protein": "Boost the protein content of your lunch.",
  "Skip Sunday": "Leave Sunday unplanned or free.",
  "Assign randomly": "Let the app distribute meals across the week randomly.",
  "Show summary": "View a final summary of your weekly meal plan.",
};

export const prompts: Record<string, string> = {
  "Let's begin!": "Let's get started with your custom weekly meal plan.",
  "How does this work?":
    "Can you explain how this meal planning tool works and how I should interact with it?",
  "Animal Based":
    "Use only animal-based foods like meat, dairy, fruit, eggs, and honey.",
  Vegetarian: "Exclude meat and fish from all meals.",
  "Low-carb": "Create meals that avoid rice, pasta, bread, and starchy foods.",
  "Looks good": "Proceed with the current list of ingredients.",
  "Remove eggs": "Exclude eggs from all meal options.",
  "Add more fruits": "Include a wider selection of fruits in my meals.",
  "2 meals": "Plan 2 meals per day.",
  "3 meals": "Plan 3 meals per day.",
  "4 meals": "Plan 4 meals per day.",
  "Add variety": "Introduce more variety in ingredients and meals.",
  "Remove remove meals": "Remove any repetitive or undesirable meals.",
  "Swap carbs": "Replace simple carbs with complex, low-GI carbs.",
  "Change breakfast": "Adjust the breakfast meal to better fit my preferences.",
  "Make lunch higher protein": "Increase protein content in lunch meals.",
  "Skip Sunday": "Do not include meals for Sunday.",
  "Assign randomly": "Randomly assign the approved meals to each day.",
  "Show summary": "Provide a summary of the final weekly meal plan.",
};
