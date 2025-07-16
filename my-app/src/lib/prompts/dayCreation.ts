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

For the ingredients listed below, return a JSON object with the following fields:
- calories_per_gram
- protein_per_gram
- default_grams: a typical portion size in grams (used by our optimizer)
- recommended_unit: the most natural unit for displaying this ingredient to users (e.g., "tbsp", "cup", "oz", "slice")
- grams_per_unit: how many grams are in one of that unit (e.g., 1 tbsp olive oil ≈ 13.5g)

Only include ingredients mentioned below. Use realistic defaults based on common food databases. If unsure, fall back to "g" as the unit and 1g = 1 unit.

Respond with ONLY JSON between [START_JSON] and [END_JSON].

${mealDescriptions}

[START_JSON]
{
  "chicken breast": {
    "calories_per_gram": 1.65,
    "protein_per_gram": 0.31,
    "default_grams": 120,
    "recommended_unit": "oz",
    "grams_per_unit": 28
  },
  ...
}
[END_JSON]
`.trim();
};
