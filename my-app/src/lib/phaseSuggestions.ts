// lib/phaseSuggestions.ts

import type { Phase } from "./store";

export const suggestionsByPhase: Record<Phase, string[]> = {
  intro: [
    "Let's get started",
    "How does this work?",
    "What do you need from me?",
  ],

  ingredients: [
    "High-protein foods",
    "Mediterranean style",
    "Vegetarian",
    "Low-carb",
    "Looks good",
    "Add more ingredients",
    "Remove something",
    "Start over",
  ],

  meal_number: [
    "3 meals total",
    "6 meals",
    "9 meals",
    "Surprise me",
    "Sounds good",
    "Too many meals",
    "Add more variety",
  ],

  meal_generation: [
    "These are great",
    "Swap one meal",
    "Simplify meals",
    "Redo meal list",
  ],

  meals_per_day: [
    "3 meals a day, easy prep",
    "2 meals a day, no cooking",
    "4 meals, I like cooking",
    "Yes, that’s right",
    "Change meals per day",
    "Update cooking preferences",
  ],

  plan_generation: [
    "Looks good!",
    "Add another day",
    "Remove a plan",
    "Back to meals",
  ],

  weekly_assignment: [
    "Skip Sunday",
    "Assign randomly",
    "Repeat favorite days",
    "Evenly distribute meals",
  ],

  conclusion: [
    "Continue to my weekly schedule",
    "Review meals again",
    "Start over!",
  ],
};

export const descriptions: Record<string, string> = {
  "Let's get started": "Begin the meal planning process.",
  "How does this work?": "Learn how this planner guides your meals.",
  "What do you need from me?": "Understand what input is expected from you.",

  "High-protein foods": "Examples: chicken, eggs, Greek yogurt, legumes.",
  "Mediterranean style": "Olive oil, fish, whole grains, vegetables.",
  Vegetarian: "No meat or fish; plant-based meals only.",
  "Low-carb": "Avoid bread, pasta, and other starchy ingredients.",

  "Looks good": "Approve the current ingredient list.",
  "Add more ingredients": "Include more foods you like.",
  "Remove something": "Exclude one or more of the listed items.",
  "Start over": "Clear all current selections and try again.",

  "3 meals a day, easy prep": "Typical eating pattern with simple recipes.",
  "2 meals a day, no cooking": "Minimal effort; no real cooking required.",
  "4 meals, I like cooking": "More variety and cooking flexibility.",

  "Yes, that’s right": "Confirm your meal and cooking preferences.",
  "Change meals per day": "Pick a different daily meal frequency.",
  "Update cooking preferences": "Adjust prep time or cooking complexity.",

  "3 meals total": "Rotate the same 3 meals all week.",
  "6 meals": "Have some variety with 6 different meals.",
  "9 meals": "High variety — a unique meal almost every day.",
  "Surprise me": "Let the system pick the right number of meals for you.",

  "Sounds good": "Confirm the total meal count.",
  "Too many meals": "Reduce the number of unique meals.",
  "Add more variety": "Include more meals in the rotation.",

  "These are great": "Approve the current list of generated meals.",
  "Swap one meal": "Replace a single meal with a new option.",
  "Simplify meals": "Make the recipes easier or faster to prepare.",
  "Redo meal list": "Start over with new meals entirely.",

  "Looks good!": "Approve the proposed day combinations.",
  "Add another day": "Generate one more day of eating.",
  "Remove a plan": "Eliminate one of the current day options.",
  "Back to meals": "Return to editing your meals before finalizing days.",

  "Skip Sunday": "Leave Sunday unplanned.",
  "Assign randomly": "Auto-assign meals to days of the week.",
  "Repeat favorite days": "Use your preferred day plans more than once.",
  "Evenly distribute meals": "Balance day types throughout the week.",

  "Continue to my weekly schedule": "Move forward to step 4.",
  "Review meals again": "Go back to revise meals before continuing.",
  "Start over!": "Restart the planning process from the beginning.",
};

export const prompts: Record<string, string> = {
  "Let's get started": "Let’s begin planning my weekly meals.",
  "How does this work?": "Can you explain how this process works?",
  "What do you need from me?": "What kind of info should I give you?",

  "High-protein foods":
    "Include protein-rich foods like eggs, chicken, yogurt, or tofu.",
  "Mediterranean style":
    "Plan meals around Mediterranean-style ingredients and flavors.",
  Vegetarian: "Make all meals vegetarian.",
  "Low-carb": "Avoid starchy ingredients and focus on low-carb meals.",

  "Looks good": "I’m happy with this list of ingredients.",
  "Add more ingredients": "I want to include a few more ingredients I like.",
  "Remove something": "Please remove some ingredients I don’t want.",
  "Start over": "Clear the ingredient list and let’s begin again.",

  "3 meals a day, easy prep":
    "Plan 3 meals per day that are simple to prepare.",
  "2 meals a day, no cooking": "I want 2 meals per day with no cooking.",
  "4 meals, I like cooking": "Give me 4 meals per day — I don’t mind cooking.",

  "Yes, that’s right": "That matches how I eat and cook.",
  "Change meals per day": "I want to change how many meals I eat each day.",
  "Update cooking preferences":
    "Let’s adjust how much cooking or prep I’m okay with.",

  "3 meals total": "Just use 3 unique meals for the whole week.",
  "6 meals": "Plan 6 different meals for some variety.",
  "9 meals": "Give me 9 total meals to rotate through.",
  "Surprise me": "Choose the right number of meals for me.",

  "Sounds good": "That meal count works for me.",
  "Too many meals": "Let’s cut down the number of meals.",
  "Add more variety": "Add more meals to give me more variety.",

  "These are great": "I like all the meals you generated.",
  "Swap one meal": "Replace just one of these meals.",
  "Simplify meals": "Make these meals easier to prepare.",
  "Redo meal list": "Let’s try an entirely different set of meals.",

  "Looks good!": "Those day combinations work for me.",
  "Add another day": "Can you generate one more full day?",
  "Remove a plan": "Let’s remove one of those day plans.",
  "Back to meals": "Let’s go back and edit the meals first.",

  "Skip Sunday": "Leave Sunday open with no plan.",
  "Assign randomly": "Distribute days randomly across the week.",
  "Repeat favorite days": "Use my favorite day plan more than once.",
  "Evenly distribute meals": "Make sure meals are balanced across the week.",

  "Continue to my weekly schedule":
    "I’m ready — let’s move on to the weekly planner.",
  "Review meals again": "Let’s go back and look at the meals again.",
  "Start over!": "Reset the meal planning process from the beginning.",
};
