import initGLPK from "glpk.js";
import type { Meal } from "@/lib/store";

// Types
interface IngredientMacros {
  [ingredientName: string]: {
    calories_per_gram: number;
    protein_per_gram: number;
  };
}

export interface OptimizationInput {
  meals: Meal[];
  ingredientMacros: IngredientMacros;
  mealsPerDay: number;
  targetCalories: number;
  targetProtein: number;
}

export interface OptimizedMealResult {
  status: string;
  objective: number;
  usedMeals: string[];
  validDays: Array<{
    meals: string[];
    positions: { [mealName: string]: number | null };
    totals: {
      calories: number;
      protein: number;
    };
    mealsDetailed: {
      [mealName: string]: {
        ingredients: Array<{
          name: string;
          grams: number;
          calories: number;
          protein: number;
        }>;
        totalCalories: number;
        totalProtein: number;
      };
    };
    ingredientPortions: {
      [mealName: string]: {
        [ingredientName: string]: {
          grams: number;
          calories: number;
          protein: number;
        };
      };
    };
  }>;
  positionAssignments: { [position: string]: string };
}

// Helper: combinations (n choose k)
function generateCombinations<T>(arr: T[], r: number): T[][] {
  if (r === 0) return [[]];
  if (arr.length === 0) return [];
  const [first, ...rest] = arr;
  const withFirst = generateCombinations(rest, r - 1).map((combo) => [
    first,
    ...combo,
  ]);
  const withoutFirst = generateCombinations(rest, r);
  return [...withFirst, ...withoutFirst];
}

export async function optimizeMeals(
  input: OptimizationInput
): Promise<OptimizedMealResult> {
  console.log("🔹 Starting GLPK.js optimization");
  console.log(
    `📊 Input: ${input.meals.length} meals, ${input.mealsPerDay} meals/day`
  );
  console.log(
    `🎯 Targets: ${input.targetCalories} cal, ${input.targetProtein}g protein`
  );
  const glpk = await initGLPK();

  const {
    meals: mealsInput,
    ingredientMacros,
    mealsPerDay,
    targetCalories,
    targetProtein,
  } = input;

  // --- Parameters ---
  const calorieSlack = 100;
  const proteinSlack = 10;
  const BIG_M = 10000;

  const avgMealCalories = targetCalories / mealsPerDay;
  const mealMinPct = 0.6;
  const mealMaxPct = 1.4;
  const mealMinCalories = avgMealCalories * mealMinPct;
  const mealMaxCalories = avgMealCalories * mealMaxPct;
  const mealProteinMinPct = 0.1;
  const mealProteinMaxPct = 0.45;
  const caloriesPerGramProtein = 4;

  console.log(
    `🎯 Meal constraints: ${mealMinCalories}-${mealMaxCalories} cal per meal`
  );

  // --- Preprocess Meals ---
  const meals = mealsInput.map((meal) => meal.name);
  const ingredients: { [mealName: string]: string[] } = {};
  const fixedIngredients: { [mealName: string]: string[] } = {};
  const scalableIngredients: { [mealName: string]: string[] } = {};
  const fixedMealCalories: { [mealName: string]: number } = {};
  const fixedMealProtein: { [mealName: string]: number } = {};

  console.log("🔍 Processing meals and ingredients...");
  for (const meal of mealsInput) {
    const mealName = meal.name;
    ingredients[mealName] = meal.ingredients.map((ing) => ing.name);
    fixedIngredients[mealName] = [];
    scalableIngredients[mealName] = [];
    fixedMealCalories[mealName] = 0;
    fixedMealProtein[mealName] = 0;
    console.log(`   Processing meal: ${mealName}`);
    for (const ing of meal.ingredients) {
      const ingName = ing.name;
      if (!(ingName in ingredientMacros)) {
        throw new Error(
          `Ingredient '${ingName}' not found in ingredient macros`
        );
      }
      if (ing.main === 0) {
        // Fixed ingredient
        fixedIngredients[mealName].push(ingName);
        const grams = ing.grams || 0;
        const calories = grams * ingredientMacros[ingName].calories_per_gram;
        const protein = grams * ingredientMacros[ingName].protein_per_gram;
        fixedMealCalories[mealName] += calories;
        fixedMealProtein[mealName] += protein;
        console.log(
          `     Fixed: ${ingName} ${grams}g -> ${calories.toFixed(
            1
          )} cal, ${protein.toFixed(1)}g protein`
        );
      } else {
        // Scalable ingredient
        scalableIngredients[mealName].push(ingName);
        console.log(`     Scalable: ${ingName}`);
      }
    }
    console.log(
      `   Meal '${mealName}' fixed totals: ${fixedMealCalories[
        mealName
      ].toFixed(1)} cal, ${fixedMealProtein[mealName].toFixed(1)}g protein`
    );
  }

  // --- Combinations ---
  console.log("🔢 Generating meal combinations...");
  const allCombinations = generateCombinations(meals, mealsPerDay);
  console.log(`   Total combinations: ${allCombinations.length}`);
  if (allCombinations.length === 0) {
    throw new Error("No meal combinations possible");
  }
  const allScalableIngredients = Array.from(
    new Set(meals.flatMap((m) => scalableIngredients[m]))
  );
  console.log(
    `   All scalable ingredients: ${allScalableIngredients.join(", ")}`
  );

  // --- Build Model ---
  console.log("🏗️ Building GLPK.js model...");
  const model: any = {
    name: "MealOptimizer",
    objective: {
      direction: glpk.GLP_MAX,
      name: "obj",
      vars: [],
    },
    subjectTo: [],
    bounds: [],
  };
  const varNames: { [key: string]: string } = {};

  // Meal portion variables
  for (const meal of meals) {
    for (const ingredient of allScalableIngredients) {
      const varName = `mp_${meal}_${ingredient}`.replace(/[^a-zA-Z0-9_]/g, "_");
      varNames[`meal_portions_${meal}_${ingredient}`] = varName;
      model.bounds.push({ name: varName, type: glpk.GLP_LO, lb: 0.0 });
    }
  }
  // Meal used variables (binary)
  for (const meal of meals) {
    const varName = `mu_${meal}`.replace(/[^a-zA-Z0-9_]/g, "_");
    varNames[`meal_used_${meal}`] = varName;
    model.bounds.push({
      name: varName,
      type: glpk.GLP_DB,
      lb: 0.0,
      ub: 1.0,
    });
  }
  // Meal position variables (binary)
  for (const meal of meals) {
    for (let pos = 0; pos < mealsPerDay; pos++) {
      const varName = `mpos_${meal}_${pos}`.replace(/[^a-zA-Z0-9_]/g, "_");
      varNames[`meal_position_${meal}_${pos}`] = varName;
      model.bounds.push({
        name: varName,
        type: glpk.GLP_DB,
        lb: 0.0,
        ub: 1.0,
      });
    }
  }
  // Combination valid variables (binary)
  for (let c = 0; c < allCombinations.length; c++) {
    const varName = `cv_${c}`;
    varNames[`combination_valid_${c}`] = varName;
    model.bounds.push({
      name: varName,
      type: glpk.GLP_DB,
      lb: 0.0,
      ub: 1.0,
    });
    // Add to objective
    model.objective.vars.push({
      name: varName,
      coef: 1.0,
    });
  }
  console.log(`   Created ${model.bounds.length} variables`);

  // --- Constraints ---

  // Meal portion bounds: portions[m,i] <= 500 * meal_used[m]
  for (const meal of meals) {
    for (const ingredient of allScalableIngredients) {
      if (!scalableIngredients[meal].includes(ingredient)) {
        // Force to 0 if ingredient not in meal
        model.subjectTo.push({
          name: `portion_bound_${meal}_${ingredient}`.replace(
            /[^a-zA-Z0-9_]/g,
            "_"
          ),
          vars: [
            {
              name: varNames[`meal_portions_${meal}_${ingredient}`],
              coef: 1.0,
            },
          ],
          bnds: { type: glpk.GLP_FX, lb: 0.0, ub: 0.0 },
        });
      } else {
        // portions[m,i] - 500 * meal_used[m] <= 0
        model.subjectTo.push({
          name: `portion_upper_${meal}_${ingredient}`.replace(
            /[^a-zA-Z0-9_]/g,
            "_"
          ),
          vars: [
            {
              name: varNames[`meal_portions_${meal}_${ingredient}`],
              coef: 1.0,
            },
            { name: varNames[`meal_used_${meal}`], coef: -500.0 },
          ],
          bnds: { type: glpk.GLP_UP, ub: 0.0 },
        });

        // portions[m,i] - 5 * meal_used[m] >= 0 (minimum ingredient consistency)
        model.subjectTo.push({
          name: `portion_lower_${meal}_${ingredient}`.replace(
            /[^a-zA-Z0-9_]/g,
            "_"
          ),
          vars: [
            {
              name: varNames[`meal_portions_${meal}_${ingredient}`],
              coef: 1.0,
            },
            { name: varNames[`meal_used_${meal}`], coef: -5.0 },
          ],
          bnds: { type: glpk.GLP_LO, lb: 0.0 },
        });
      }
    }
  }

  // Meal single position: sum(meal_position[m,p] for p) <= 1
  for (const meal of meals) {
    const vars: Array<{ name: string; coef: number }> = [];
    for (let pos = 0; pos < mealsPerDay; pos++) {
      vars.push({
        name: varNames[`meal_position_${meal}_${pos}`],
        coef: 1.0,
      });
    }
    model.subjectTo.push({
      name: `single_pos_${meal}`.replace(/[^a-zA-Z0-9_]/g, "_"),
      vars,
      bnds: { type: glpk.GLP_UP, ub: 1.0 },
    });
  }

  // Meal used iff positioned: meal_used[m] = sum(meal_position[m,p] for p)
  for (const meal of meals) {
    const vars: Array<{ name: string; coef: number }> = [
      { name: varNames[`meal_used_${meal}`], coef: 1.0 },
    ];
    for (let pos = 0; pos < mealsPerDay; pos++) {
      vars.push({
        name: varNames[`meal_position_${meal}_${pos}`],
        coef: -1.0,
      });
    }
    model.subjectTo.push({
      name: `used_iff_pos_${meal}`.replace(/[^a-zA-Z0-9_]/g, "_"),
      vars,
      bnds: { type: glpk.GLP_FX, lb: 0.0, ub: 0.0 },
    });
  }

  // Meal calorie constraints
  for (const meal of meals) {
    const vars: Array<{ name: string; coef: number }> = [];
    // Add scalable ingredient calories
    for (const ingredient of scalableIngredients[meal]) {
      vars.push({
        name: varNames[`meal_portions_${meal}_${ingredient}`],
        coef: ingredientMacros[ingredient].calories_per_gram,
      });
    }
    // Add fixed calories term: -fixed_calories * meal_used[m]
    vars.push({
      name: varNames[`meal_used_${meal}`],
      coef: -fixedMealCalories[meal],
    });
    // Lower bound
    const lowerVars = [...vars];
    lowerVars[lowerVars.length - 1].coef =
      fixedMealCalories[meal] - mealMinCalories;
    model.subjectTo.push({
      name: `cal_lower_${meal}`.replace(/[^a-zA-Z0-9_]/g, "_"),
      vars: lowerVars,
      bnds: { type: glpk.GLP_LO, lb: 0.0 },
    });
    // Upper bound
    const upperVars = [...vars];
    upperVars[upperVars.length - 1].coef =
      fixedMealCalories[meal] - mealMaxCalories;
    model.subjectTo.push({
      name: `cal_upper_${meal}`.replace(/[^a-zA-Z0-9_]/g, "_"),
      vars: upperVars,
      bnds: { type: glpk.GLP_UP, ub: 0.0 },
    });
  }

  // Meal protein constraints
  for (const meal of meals) {
    const lowerVars: Array<{ name: string; coef: number }> = [];
    const upperVars: Array<{ name: string; coef: number }> = [];
    for (const ingredient of scalableIngredients[meal]) {
      const protPerGram = ingredientMacros[ingredient].protein_per_gram;
      const calPerGram = ingredientMacros[ingredient].calories_per_gram;
      const lowerCoef =
        protPerGram * caloriesPerGramProtein - calPerGram * mealProteinMinPct;
      const upperCoef =
        protPerGram * caloriesPerGramProtein - calPerGram * mealProteinMaxPct;
      const varName = varNames[`meal_portions_${meal}_${ingredient}`];
      lowerVars.push({ name: varName, coef: lowerCoef });
      upperVars.push({ name: varName, coef: upperCoef });
    }
    // Add fixed (non-scalable) contribution via meal_used variable
    const fixedProt = fixedMealProtein[meal];
    const fixedCals = fixedMealCalories[meal];
    const fixedLowerCoef =
      fixedProt * caloriesPerGramProtein - fixedCals * mealProteinMinPct;
    const fixedUpperCoef =
      fixedProt * caloriesPerGramProtein - fixedCals * mealProteinMaxPct;
    const usedVarName = varNames[`meal_used_${meal}`];
    lowerVars.push({ name: usedVarName, coef: fixedLowerCoef });
    upperVars.push({ name: usedVarName, coef: fixedUpperCoef });
    model.subjectTo.push({
      name: `prot_lower_${meal}`.replace(/[^a-zA-Z0-9_]/g, "_"),
      vars: lowerVars,
      bnds: { type: glpk.GLP_LO, lb: 0.0 },
    });
    model.subjectTo.push({
      name: `prot_upper_${meal}`.replace(/[^a-zA-Z0-9_]/g, "_"),
      vars: upperVars,
      bnds: { type: glpk.GLP_UP, ub: 0.0 },
    });
  }

  // Combination constraints
  for (let c = 0; c < allCombinations.length; c++) {
    const combo = allCombinations[c];
    // Position consistency: combination_valid[c] <= meal_position[meal, pos] for each meal at pos
    for (let pos = 0; pos < mealsPerDay; pos++) {
      const mealAtPos = combo[pos];
      model.subjectTo.push({
        name: `combo_pos_${c}_${pos}`,
        vars: [
          { name: varNames[`combination_valid_${c}`], coef: 1.0 },
          { name: varNames[`meal_position_${mealAtPos}_${pos}`], coef: -1.0 },
        ],
        bnds: { type: glpk.GLP_UP, ub: 0.0 },
      });
    }
    // Combination calorie constraints
    const comboCalVars: Array<{ name: string; coef: number }> = [];
    for (const meal of combo) {
      // Add scalable calories
      for (const ingredient of scalableIngredients[meal]) {
        comboCalVars.push({
          name: varNames[`meal_portions_${meal}_${ingredient}`],
          coef: ingredientMacros[ingredient].calories_per_gram,
        });
      }
      // Add fixed calories
      comboCalVars.push({
        name: varNames[`meal_used_${meal}`],
        coef: fixedMealCalories[meal],
      });
    }
    // Lower bound: total_calories >= (target - slack) * valid
    const lowerCalVars = [...comboCalVars];
    lowerCalVars.push({
      name: varNames[`combination_valid_${c}`],
      coef: -(targetCalories - calorieSlack),
    });
    model.subjectTo.push({
      name: `combo_cal_lower_${c}`,
      vars: lowerCalVars,
      bnds: { type: glpk.GLP_LO, lb: 0.0 },
    });
    // Upper bound
    const upperCalVars = [...comboCalVars];
    upperCalVars.push({
      name: varNames[`combination_valid_${c}`],
      coef: BIG_M - (targetCalories + calorieSlack),
    });
    model.subjectTo.push({
      name: `combo_cal_upper_${c}`,
      vars: upperCalVars,
      bnds: { type: glpk.GLP_UP, ub: BIG_M },
    });
    // Combination protein constraints (similar structure)
    const comboProtVars: Array<{ name: string; coef: number }> = [];
    for (const meal of combo) {
      for (const ingredient of scalableIngredients[meal]) {
        comboProtVars.push({
          name: varNames[`meal_portions_${meal}_${ingredient}`],
          coef: ingredientMacros[ingredient].protein_per_gram,
        });
      }
      comboProtVars.push({
        name: varNames[`meal_used_${meal}`],
        coef: fixedMealProtein[meal],
      });
    }
    // Lower bound
    const lowerProtVars = [...comboProtVars];
    lowerProtVars.push({
      name: varNames[`combination_valid_${c}`],
      coef: -(targetProtein - proteinSlack),
    });
    model.subjectTo.push({
      name: `combo_prot_lower_${c}`,
      vars: lowerProtVars,
      bnds: { type: glpk.GLP_LO, lb: 0.0 },
    });
    // Upper bound
    const upperProtVars = [...comboProtVars];
    upperProtVars.push({
      name: varNames[`combination_valid_${c}`],
      coef: BIG_M - (targetProtein + proteinSlack),
    });
    model.subjectTo.push({
      name: `combo_prot_upper_${c}`,
      vars: upperProtVars,
      bnds: { type: glpk.GLP_UP, ub: BIG_M },
    });
  }

  // --- Solve ---
  console.log("🚀 Solving with GLPK.js...");
  const result = await glpk.solve(model, glpk.GLP_MSG_ALL);
  console.log("GLPK result:", result);

  // Defensive structure access
  const glpkStatus = result.result?.status;
  const glpkVars = result.result?.vars;
  const glpkObjective = result.result?.z;
  console.log(`   Status: ${glpkStatus}`);
  console.log(`   Objective: ${glpkObjective}`);

  if (glpkStatus !== glpk.GLP_OPT) {
    return {
      status: glpkStatus?.toString() ?? "unknown",
      objective: 0,
      usedMeals: [],
      validDays: [],
      positionAssignments: {},
    };
  }

  // --- Parse Solution ---
  const varValues: { [name: string]: number } = {};
  Object.entries(glpkVars).forEach(([name, value]) => {
    varValues[name] = value as number;
  });

  const output: OptimizedMealResult = {
    status: glpkStatus?.toString() ?? "unknown",
    objective: Math.round(glpkObjective || 0),
    usedMeals: [],
    validDays: [],
    positionAssignments: {},
  };

  // Assign meals and positions
  const mealPositions: { [meal: string]: number } = {};
  for (const meal of meals) {
    const mealUsedVar = varNames[`meal_used_${meal}`];
    if (varValues[mealUsedVar] > 0.5) {
      output.usedMeals.push(meal);
      for (let pos = 0; pos < mealsPerDay; pos++) {
        const posVar = varNames[`meal_position_${meal}_${pos}`];
        if (varValues[posVar] > 0.5) {
          mealPositions[meal] = pos;
          output.positionAssignments[pos.toString()] = meal;
          break;
        }
      }
    }
  }

  // Valid combos
  for (let c = 0; c < allCombinations.length; c++) {
    const comboVar = varNames[`combination_valid_${c}`];
    if (varValues[comboVar] > 0.5) {
      const combo = allCombinations[c];
      const mealsDetailed: any = {};
      const ingredientPortions: any = {};
      let totalCalories = 0;
      let totalProtein = 0;

      for (const meal of combo) {
        ingredientPortions[meal] = {};
        const mealIngredients: any[] = [];
        let mealCalories = 0;
        let mealProtein = 0;
        // Fixed
        for (const ingredient of fixedIngredients[meal]) {
          const originalMeal = mealsInput.find((m) => m.name === meal);
          const originalIng = originalMeal?.ingredients.find(
            (i) => i.name === ingredient && i.main === 0
          );
          const grams = originalIng?.grams || 0;
          const cal = grams * ingredientMacros[ingredient].calories_per_gram;
          const prot = grams * ingredientMacros[ingredient].protein_per_gram;
          mealCalories += cal;
          mealProtein += prot;
          const ingData = {
            name: ingredient,
            grams: Math.round(grams * 10) / 10,
            calories: Math.round(cal * 10) / 10,
            protein: Math.round(prot * 10) / 10,
          };
          mealIngredients.push(ingData);
          ingredientPortions[meal][ingredient] = ingData;
        }
        // Scalable
        for (const ingredient of scalableIngredients[meal]) {
          const portionVar = varNames[`meal_portions_${meal}_${ingredient}`];
          const grams = varValues[portionVar] || 0;
          if (grams > 0.1) {
            const cal = grams * ingredientMacros[ingredient].calories_per_gram;
            const prot = grams * ingredientMacros[ingredient].protein_per_gram;
            mealCalories += cal;
            mealProtein += prot;
            const ingData = {
              name: ingredient,
              grams: Math.round(grams * 10) / 10,
              calories: Math.round(cal * 10) / 10,
              protein: Math.round(prot * 10) / 10,
            };
            mealIngredients.push(ingData);
            ingredientPortions[meal][ingredient] = ingData;
          }
        }
        mealsDetailed[meal] = {
          ingredients: mealIngredients,
          totalCalories: Math.round(mealCalories * 10) / 10,
          totalProtein: Math.round(mealProtein * 10) / 10,
        };
        totalCalories += mealCalories;
        totalProtein += mealProtein;
      }
      output.validDays.push({
        meals: [...combo],
        positions: Object.fromEntries(
          combo.map((meal) => [meal, mealPositions[meal] || null])
        ),
        totals: {
          calories: Math.round(totalCalories * 10) / 10,
          protein: Math.round(totalProtein * 10) / 10,
        },
        mealsDetailed,
        ingredientPortions,
      });
    }
  }

  console.log(`✅ Found ${output.validDays.length} valid combinations`);
  return output;
}
