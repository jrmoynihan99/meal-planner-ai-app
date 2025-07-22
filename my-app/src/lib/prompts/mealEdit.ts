// /lib/prompts/mealEdit.ts
import type { Meal } from "@/lib/store";

export function buildMealEditPrompt(
  generatedMeals: Meal[],
  userRequest: string
) {
  return `
You are a meal planning assistant.

The user has already generated several meals. Here's the full list:

${JSON.stringify(generatedMeals, null, 2)}

User request: "${userRequest}"

Your task:
- Identify which single meal the user is referring to.
- Modify it based on the request (e.g., removing, adding, or changing ingredients, description, or steps).
- If applicable, update the \`bestFor\` field to reflect the most appropriate type ("breakfast", "lunch", "dinner", or "versatile").
- Return just **one** modified meal in this format:

\`\`\`json
{
  "id": "same ID as the original",
  "name": "possibly updated",
  "description": "updated",
  "bestFor": "lunch",
  "ingredients": [ ... ],
  "recipe": [ ... ]
}
\`\`\`

Important:
- You must keep the original \`id\` field. Do not generate a new one.
- Return only the single modified meal object as valid JSON. No commentary or explanation.
`;
}
