import { Meal, StepThreePlannerData } from "@/lib/store";
import { useAppStore } from "@/lib/store";

type SetStepThreeData = (partial: Partial<StepThreePlannerData>) => void;

export async function generateImagesForMealsInBackground(
  meals: Meal[],
  setStepThreeData: SetStepThreeData
) {
  const mealsToUpdate = meals.filter((meal) => !meal.imageUrl);

  console.log(`📸 Starting image generation for ${mealsToUpdate.length} meals`);

  await Promise.all(
    mealsToUpdate.map(async (meal) => {
      try {
        const res = await fetch("/api/generate-meal-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meal }),
        });

        const data = await res.json();

        if (data?.imageUrl) {
          const currentMeals =
            useAppStore.getState().stepThreeData?.generatedMeals ?? [];

          let matched = false;

          const updatedMeals = currentMeals.map((m) => {
            const matchById = m.id === data.id;
            const matchByName =
              m.name.toLowerCase() === meal.name.toLowerCase();

            if (matchById || matchByName) {
              matched = true;
              return { ...m, imageUrl: data.imageUrl };
            }

            return m;
          });

          if (matched) {
            setStepThreeData({ generatedMeals: updatedMeals });
          } else {
            console.warn(`⚠️ No match found for image update: ${meal.name}`);
          }
        } else {
          console.warn(`⚠️ No image URL returned for ${meal.name}`, data);
        }
      } catch (err) {
        console.error(`❌ Failed to generate image for "${meal.name}"`, err);
      }
    })
  );
}
