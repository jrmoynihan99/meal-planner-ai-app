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
        "name": "skinless chicken breast",
        "amount": "6 oz",
        "grams": 170,
        "mainProtein": 1,
        "recommended_unit": "oz",
        "grams_per_unit": 28.35,
        "protein_per_gram": 0.224,
        "calories_per_gram": 1.647
      },
      {
        "name": "white rice",
        "amount": "3/4 cup",
        "grams": 130,
        "mainProtein": 0,
        "recommended_unit": "cup",
        "grams_per_unit": 175,
        "protein_per_gram": 0.062,
        "calories_per_gram": 1.708
      },
      {
        "name": "broccoli",
        "amount": "1 cup",
        "grams": 90,
        "mainProtein": 0,
        "recommended_unit": "cup",
        "grams_per_unit": 90,
        "protein_per_gram": 0.028,
        "calories_per_gram": 0.333
      },
      {
        "name": "tzatziki sauce",
        "amount": "2 tbsp",
        "grams": 30,
        "mainProtein": 0,
        "recommended_unit": "tbsp",
        "grams_per_unit": 15,
        "protein_per_gram": 0.033,
        "calories_per_gram": 1.667
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
- 'mainProtein' should be 1 for any ingredient that is considered a main protein ingredient (if any).
- Ingredients must be individual food items. Never include food groups or non-specific ingredients (e.g. never return 'mixed vegetables', list the individual vegetables).
- Every ingredient must include these fields: 'name', 'amount', 'grams', 'mainProtein', 'recommended_unit', 'grams_per_unit', 'protein_per_gram', 'calories_per_gram'.
- 'grams_per_unit' means how many grams are in one recommended unit (e.g., 1 cup, 1 oz, 1 tbsp). This is essential for converting between units and grams.
- Be detailed with the type of ingredient, like meat leanness, chicken type, etc.
- Use the same name for the same ingredients across all meals.
- Return only the JSON array. Do not include commentary or explanation.
`;
}
