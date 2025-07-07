import { Meal } from "@/lib/store";
import { ingredientMacroPrompt } from "@/lib/prompts/dayCreation";

export async function fetchIngredientMacros(approvedMeals: Meal[]) {
  const prompt = ingredientMacroPrompt(approvedMeals);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt: prompt, messages: [] }),
  });

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let text = "";

  if (!reader) throw new Error("No reader on GPT response");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }

  const match = text.match(/\[START_JSON\]([\s\S]*?)\[END_JSON\]/);
  if (!match) throw new Error("No [START_JSON] block found");

  return JSON.parse(match[1]);
}
