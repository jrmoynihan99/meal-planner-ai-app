import type { Meal } from "@/lib/store"; // or the correct relative path

/*export const mealSelectionPrompt = ({
  mealsPerDay,
  approvedMeals,
}: {
  mealsPerDay: number;
  approvedMeals: { name: string; description: string }[];
}) => {
  const formattedMeals = approvedMeals
    .map((m) => `- ${m.name}: ${m.description}`)
    .join("\n");

  return `
You are a nutrition assistant. A user has approved the following meals:

${formattedMeals}

They want to eat ${mealsPerDay} meals per day.

Please select ${mealsPerDay} meals that make sense for a single day of eating:
- Include something breakfast-like for the morning
- Include lunch/dinner type meals later
- Avoid recommending three smoothies or three heavy dinners
- Use common sense, even if it’s not perfect

Return only JSON — an ordered array of meal names:
["Breakfast Meal", "Lunch Meal", "Dinner Meal"]
  `.trim();
};*/

export const ingredientMacroPrompt = (meals: Meal[]) => {
  const mealDescriptions = meals
    .map((meal) => {
      const ingredients = meal.ingredients.map((i) => `- ${i.name}`).join("\n");
      return `Meal: ${meal.name}\nIngredients:\n${ingredients}`;
    })
    .join("\n\n");

  return `
You are a nutrition assistant.

For the ingredients listed below, return a JSON object with the following values:
- calories_per_gram
- protein_per_gram
- default_grams (a reasonable serving size in grams for use in a meal optimizer)

Only include ingredients mentioned. Use realistic serving sizes (e.g., 120g chicken breast, 10g olive oil).

Respond with ONLY JSON between [START_JSON] and [END_JSON].

${mealDescriptions}

[START_JSON]
{
  "chicken breast": {
    "calories_per_gram": 1.65,
    "protein_per_gram": 0.31,
    "default_grams": 120
  },
  ...
}
[END_JSON]
  `.trim();
};
