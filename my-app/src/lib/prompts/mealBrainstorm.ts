// /lib/mealBrainstorm.ts

export function buildMealBrainstormPrompt(
  preferences: any,
  mealsPerDay: number,
  previouslyApprovedMeals: any[] = [],
  previouslyGeneratedMeals: any[] = []
) {
  const approvedNames = previouslyApprovedMeals.map((m) => m.name).join(", ");
  const generatedNames = previouslyGeneratedMeals.map((m) => m.name).join(", ");

  return `
You are a meal planner assistant.

The user has already generated the following meals:
${generatedNames || "None"}

They have already approved these meals:
${approvedNames || "None"}

Generate ${
    mealsPerDay * 2
  } new, **unique** meals that are **not duplicates** or too similar to any of the meals listed above.

Use these preferences:

• Proteins: ${preferences.proteins.join(", ") || "none"}
• Carbs: ${preferences.carbs.join(", ") || "none"}
• Veggies: ${preferences.veggies.join(", ") || "none"}
• Cuisines: ${preferences.cuisines.join(", ") || "none"}
• Likes fruit: ${preferences.likesFruit ? "Yes" : "No"}
• Custom input: ${preferences.customInput || "None"}

Each meal should:
- Be simple and realistic.
- Focus on ingredients the user prefers.
- Be different from the previously generated meals.
- Be labeled as best for one of the following: "breakfast", "lunch", "dinner", or "versatile" using a \`bestFor\` field.

Return the result as a JSON array of meals in this format:

\`\`\`json
[
  {
    "name": "Grilled Chicken Bowl",
    "description": "Grilled chicken served with white rice, broccoli, and tzatziki.",
    "bestFor": "lunch",
    "ingredients": [
      {
        "name": "chicken breast",
        "amount": "6 oz",
        "grams": 170,
        "main": 1,
        "protein": 38,
        "calories": 280
      },
      {
        "name": "white rice",
        "amount": "3/4 cup",
        "grams": 130,
        "main": 1,
        "protein": 8,
        "calories": 222
      },
      {
        "name": "broccoli",
        "amount": "1 cup",
        "grams": 90,
        "main": 0,
        "protein": 2.5,
        "calories": 30
      },
      {
        "name": "tzatziki sauce",
        "amount": "2 tbsp",
        "grams": 30,
        "main": 0,
        "protein": 1,
        "calories": 50
      }
    ],
    "recipe": [
      "Grill the chicken until fully cooked.",
      "Cook the white rice in rice cooker or on a pan.",
      "Steam the broccoli.",
      "Serve everything in a bowl with tzatziki sauce."
    ]
  }
]
\`\`\`

Important:
- 'main' should be 1 for the key protein/carb items, 0 for veggies, sauces, oils, spices, etc.
- Ingredients must be individual food items. Never include food groups or non-specific ingredients (e.g. never return 'mixed vegetables', list the individual vegetables)
- Be detailed with the type of ingredient, like meat leanness, chicken type, etc.
- Every ingredient must include a realistic 'grams' value and 'amount'.
- Use the same name for the same ingredients across all meals. 
- Return only the JSON array. Do not include commentary or explanation.
`;
}
