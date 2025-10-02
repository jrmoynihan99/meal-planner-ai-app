import { Meal } from "@/lib/store";
import { ingredientMacroPrompt } from "@/lib/prompts/dayCreation";

export async function fetchIngredientMacros(approvedMeals: Meal[]) {
  // Log the entire approvedMeals array as formatted JSON
  console.log(
    "📦 [fetchIngredientMacros] Approved meals passed in:\n",
    JSON.stringify(approvedMeals, null, 2)
  );

  const prompt = ingredientMacroPrompt(approvedMeals);

  // Log the full system prompt
  console.log("🧠 [fetchIngredientMacros] Sending GPT macro prompt...");
  console.log("📝 [fetchIngredientMacros] systemPrompt:\n", prompt);

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
    const chunk = decoder.decode(value, { stream: true });
    text += chunk;
    console.debug("🔹 [fetchIngredientMacros] Stream chunk:", chunk);
  }

  console.debug("🧾 [fetchIngredientMacros] Full GPT response:", text);

  const match = text.match(/\[START_JSON\]([\s\S]*?)\[END_JSON\]/);
  if (!match) {
    console.error("❌ [fetchIngredientMacros] No [START_JSON] block found");
    throw new Error("No [START_JSON] block found");
  }

  const rawJson = match[1];

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
    console.log("🧾 [fetchIngredientMacros] Parsed raw JSON from GPT:", parsed);
  } catch (err) {
    console.error(
      "❌ [fetchIngredientMacros] Failed to parse JSON block:",
      rawJson
    );
    throw new Error("Malformed JSON in GPT response");
  }

  // Normalize keys to lowercase
  const normalized: Record<string, (typeof parsed)[string]> = {};
  for (const key in parsed) {
    normalized[key.toLowerCase()] = parsed[key];
  }

  console.log(
    "✅ [fetchIngredientMacros] Parsed macros for ingredients:",
    Object.keys(normalized)
  );

  return normalized;
}
