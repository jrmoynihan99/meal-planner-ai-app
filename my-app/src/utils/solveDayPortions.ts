import initGLPK, { GLPK } from "glpk.js";
import { Meal, MealIngredient } from "../lib/store";

// ---------- TOLERANCE CONFIGURATION ----------
const CALORIE_TOLERANCE_UPPER = 100;
const CALORIE_TOLERANCE_LOWER = 100;
const PROTEIN_TOLERANCE_UPPER = 30;
const PROTEIN_TOLERANCE_LOWER = 10;

// ---------- CONSTRAINT CONFIGURATION ----------
// Per-meal proportional constraint tolerance (±10% means 0.1)
const PER_MEAL_PROPORTION_TOLERANCE = 0.1;

// Main protein percentage requirement (0.75 = 75% of meal's total protein should come from main protein)
const MAIN_PROTEIN_PERCENTAGE_REQUIREMENT = 0.5;

// ---------- Interfaces ----------
export interface PortionedMeal {
  mealId: string;
  mealName: string;
  ingredients: MealIngredient[];
  totalCalories: number;
  totalProtein: number;
}

export interface DayPortionResult {
  meals: PortionedMeal[];
  dayCalories: number;
  dayProtein: number;
  valid: boolean;
}

// ---------- Type definitions for GLPK ----------
interface GLPKConstraint {
  name: string;
  vars: string[];
  coefs: number[];
  bnds: {
    type: number;
    lb: number;
    ub: number;
  };
}

interface GLPKBound {
  name: string;
  type: number;
  lb: number;
  ub: number;
}

interface GLPKSolveResult {
  result?: {
    status: number;
    vars?: Record<string, number>;
  };
}

// ---------- Utility: Async Solver ----------
function getPerMealBounds(mealsPerDay: number) {
  const base = 1 / mealsPerDay;
  const lower = Math.max(0, base - 0.1);
  const upper = Math.min(1, base + 0.1);
  return { lower, upper };
}

export async function solveDayPortions(
  dayMeals: Meal[],
  targetCalories: number,
  targetProtein: number,
  lockedPortions: Record<string, PortionedMeal>
): Promise<DayPortionResult> {
  console.log("🔍 DETAILED SOLVER DEBUG - solveDayPortions");
  console.log("Target Calories:", targetCalories);
  console.log("Target Protein:", targetProtein);

  const glpk: GLPK = await initGLPK();

  // --- 0. Separate locked and unlocked meals ---
  const mealStatus: Array<{
    meal: Meal;
    originalIndex: number;
    isLocked: boolean;
    lockedPortion?: PortionedMeal;
  }> = [];

  const unlockedMeals: Meal[] = [];
  const unlockedMealIndices: number[] = [];

  let lockedCalories = 0;
  let lockedProtein = 0;

  dayMeals.forEach((meal, originalIndex) => {
    const locked = lockedPortions[meal.id];
    if (locked) {
      mealStatus.push({
        meal,
        originalIndex,
        isLocked: true,
        lockedPortion: locked,
      });
      lockedCalories += locked.totalCalories;
      lockedProtein += locked.totalProtein;
    } else {
      mealStatus.push({
        meal,
        originalIndex,
        isLocked: false,
      });
      unlockedMeals.push(meal);
      unlockedMealIndices.push(originalIndex);
    }
  });

  console.log("Locked calories:", lockedCalories);
  console.log("Locked protein:", lockedProtein);
  console.log("Unlocked meals count:", unlockedMeals.length);

  // If all meals are locked, validate them against targets
  if (unlockedMeals.length === 0) {
    const orderedLockedMeals = mealStatus.map(
      (status) => status.lockedPortion!
    );

    // ✅ VALIDATION: Check if locked portions meet targets
    const withinCalorieRange =
      lockedCalories >= targetCalories - CALORIE_TOLERANCE_LOWER &&
      lockedCalories <= targetCalories + CALORIE_TOLERANCE_UPPER;

    const withinProteinRange =
      lockedProtein >= targetProtein - PROTEIN_TOLERANCE_LOWER &&
      lockedProtein <= targetProtein + PROTEIN_TOLERANCE_UPPER;

    const isValid = withinCalorieRange && withinProteinRange;

    console.log(`\n--- ALL MEALS LOCKED VALIDATION ---`);
    console.log(
      `Locked totals: ${lockedCalories.toFixed(1)} cal, ${lockedProtein.toFixed(
        1
      )}g protein`
    );
    console.log(`Target: ${targetCalories} cal, ${targetProtein}g protein`);
    console.log(
      `Allowed range: ${targetCalories - CALORIE_TOLERANCE_LOWER} to ${
        targetCalories + CALORIE_TOLERANCE_UPPER
      } cal, ${targetProtein - PROTEIN_TOLERANCE_LOWER} to ${
        targetProtein + PROTEIN_TOLERANCE_UPPER
      }g protein`
    );
    console.log(`Within calorie range: ${withinCalorieRange}`);
    console.log(`Within protein range: ${withinProteinRange}`);
    console.log(
      `Final validation result: ${isValid ? "✅ VALID" : "❌ INVALID"}`
    );

    return {
      meals: orderedLockedMeals,
      dayCalories: lockedCalories,
      dayProtein: lockedProtein,
      valid: isValid,
    };
  }

  // Adjust targets for remaining unlocked meals
  const remainingCalories = targetCalories - lockedCalories;
  const remainingProtein = targetProtein - lockedProtein;

  console.log("Remaining calories after locked:", remainingCalories);
  console.log("Remaining protein after locked:", remainingProtein);

  // If locked portions already exceed targets, this day is invalid
  if (remainingCalories < 0 || remainingProtein < 0) {
    console.log("❌ Invalid: Locked portions exceed targets");
    return {
      meals: [],
      dayCalories: 0,
      dayProtein: 0,
      valid: false,
    };
  }

  const mealsPerDay = unlockedMeals.length;
  const { lower, upper } = getPerMealBounds(mealsPerDay);

  console.log("Per meal bounds: lower =", lower, "upper =", upper);

  // ------ 1. Build variables for unlocked meals only ------
  const varNames: string[] = [];
  const nonProteinVars: string[] = [];
  const mainProteinVars: string[] = [];

  // Map for ingredient type and bounds
  const mainProteinBounds: { [key: string]: { lb: number; ub: number } } = {};
  const scalingBounds: { [key: string]: { lb: number; ub: number } } = {};

  unlockedMeals.forEach((meal, mIdx) => {
    console.log(`\n--- ANALYZING MEAL ${mIdx}: ${meal.name} ---`);

    // --- Scaling variable for non-mainProtein ---
    const sVar = `s_${mIdx}`;
    varNames.push(sVar);
    nonProteinVars.push(sVar);
    scalingBounds[sVar] = { lb: 0, ub: 100 };

    console.log(`Added scaling variable: ${sVar}`);

    // --- Check if meal has any main protein ingredients ---
    const hasMainProtein = meal.ingredients.some(
      (ing) => ing.mainProtein === 1
    );

    console.log("Ingredients analysis:");
    meal.ingredients.forEach((ing, idx) => {
      console.log(`  [${idx}] ${ing.name}:`);
      console.log(`    - grams: ${ing.grams}`);
      console.log(`    - calories: ${ing.calories}`);
      console.log(`    - protein: ${ing.protein}`);
      console.log(`    - mainProtein: ${ing.mainProtein}`);
      console.log(`    - calories_per_gram: ${ing.calories_per_gram}`);
      console.log(`    - protein_per_gram: ${ing.protein_per_gram}`);

      // Check if this ingredient will be skipped
      if (!ing.grams) {
        console.log(`    ⚠️  WILL BE SKIPPED due to !ing.grams`);
      }
    });

    if (hasMainProtein) {
      const mpVar = `mp_${mIdx}`; // main protein multiplier (not absolute grams)
      varNames.push(mpVar);
      mainProteinVars.push(mpVar);

      console.log(`Added main protein multiplier: ${mpVar}`);

      // Reasonable bounds: [0, 10] (meaning 0x to 10x original amounts)
      mainProteinBounds[mpVar] = { lb: 0, ub: 10 };
    } else {
      console.log("No main protein ingredients found");
    }
  });

  console.log("\n--- VARIABLE SUMMARY ---");
  console.log("All variables:", varNames);
  console.log("Non-protein vars:", nonProteinVars);
  console.log("Main protein vars:", mainProteinVars);

  // ---------- 2. Build constraints ----------
  const constraints: GLPKConstraint[] = [];

  // --- (a) Day calorie/protein totals (adjusted for locked portions) ---
  const calorieCoeffs = Array(varNames.length).fill(0);
  const proteinCoeffs = Array(varNames.length).fill(0);

  console.log("\n--- BUILDING CALORIE/PROTEIN COEFFICIENTS ---");

  unlockedMeals.forEach((meal, mIdx) => {
    console.log(`\nMeal ${mIdx} (${meal.name}) coefficient calculation:`);

    const sIdx = varNames.indexOf(`s_${mIdx}`);
    const mpIdx = varNames.indexOf(`mp_${mIdx}`);

    console.log(
      `  sIdx (scaling): ${sIdx}, mpIdx (main protein multiplier): ${mpIdx}`
    );

    let nonMainCal = 0;
    let nonMainProt = 0;
    let mainProtCalTotal = 0; // Total calories from all main proteins at original amounts
    let mainProtProtTotal = 0; // Total protein from all main proteins at original amounts

    meal.ingredients.forEach((ing, ingIdx) => {
      console.log(`  Processing ingredient ${ingIdx}: ${ing.name}`);

      if (!ing.grams) {
        console.log(`    ❌ SKIPPING due to !ing.grams (grams = ${ing.grams})`);
        return;
      }

      const calculatedCalPerGram =
        ing.calories_per_gram ?? (ing.calories ?? 0) / (ing.grams ?? 1);
      const calculatedProtPerGram =
        ing.protein_per_gram ?? (ing.protein ?? 0) / (ing.grams ?? 1);

      console.log(
        `    ✅ Processing: grams=${ing.grams}, cal_per_gram=${calculatedCalPerGram}, prot_per_gram=${calculatedProtPerGram}`
      );

      if (ing.mainProtein === 1) {
        // Add this ingredient's total contribution to main protein totals
        const ingredientTotalCal = (ing.grams ?? 0) * calculatedCalPerGram;
        const ingredientTotalProt = (ing.grams ?? 0) * calculatedProtPerGram;

        mainProtCalTotal += ingredientTotalCal;
        mainProtProtTotal += ingredientTotalProt;

        console.log(
          `    📝 Main protein: +${ingredientTotalCal} cal, +${ingredientTotalProt} prot (running main totals: ${mainProtCalTotal} cal, ${mainProtProtTotal} prot)`
        );
      } else {
        const ingredientTotalCal = (ing.grams ?? 0) * calculatedCalPerGram;
        const ingredientTotalProt = (ing.grams ?? 0) * calculatedProtPerGram;

        nonMainCal += ingredientTotalCal;
        nonMainProt += ingredientTotalProt;

        console.log(
          `    📝 Non-main: +${ingredientTotalCal} cal, +${ingredientTotalProt} prot (running non-main totals: ${nonMainCal} cal, ${nonMainProt} prot)`
        );
      }
    });

    console.log(`  Final coefficients for meal ${mIdx}:`);
    console.log(`    nonMainCal: ${nonMainCal}`);
    console.log(`    nonMainProt: ${nonMainProt}`);
    console.log(`    mainProtCalTotal: ${mainProtCalTotal}`);
    console.log(`    mainProtProtTotal: ${mainProtProtTotal}`);

    if (sIdx !== -1) {
      calorieCoeffs[sIdx] = nonMainCal;
      proteinCoeffs[sIdx] = nonMainProt;
      console.log(`    Set calorieCoeffs[${sIdx}] = ${nonMainCal}`);
      console.log(`    Set proteinCoeffs[${sIdx}] = ${nonMainProt}`);
    }
    if (mpIdx !== -1) {
      calorieCoeffs[mpIdx] = mainProtCalTotal;
      proteinCoeffs[mpIdx] = mainProtProtTotal;
      console.log(`    Set calorieCoeffs[${mpIdx}] = ${mainProtCalTotal}`);
      console.log(`    Set proteinCoeffs[${mpIdx}] = ${mainProtProtTotal}`);
    }
  });

  console.log("\n--- FINAL COEFFICIENT ARRAYS ---");
  console.log("Variables:", varNames);
  console.log("Calorie coeffs:", calorieCoeffs);
  console.log("Protein coeffs:", proteinCoeffs);

  // Calculate what the constraint bounds should be using tolerance constants
  const calorieUpperBound = remainingCalories + CALORIE_TOLERANCE_UPPER;
  const calorieLowerBound = remainingCalories - CALORIE_TOLERANCE_LOWER;
  const proteinLowerBound = remainingProtein - PROTEIN_TOLERANCE_LOWER;
  const proteinUpperBound = remainingProtein + PROTEIN_TOLERANCE_UPPER;

  console.log("\n--- CONSTRAINT BOUNDS ---");
  console.log(
    `Calorie constraint: ${calorieLowerBound} ≤ total_calories ≤ ${calorieUpperBound}`
  );
  console.log(
    `Protein constraint: ${proteinLowerBound} ≤ total_protein ≤ ${proteinUpperBound}`
  );

  // Use remaining targets instead of full targets
  constraints.push({
    name: "day_cals_lower",
    vars: varNames,
    coefs: calorieCoeffs,
    bnds: { type: glpk.GLP_LO, lb: calorieLowerBound, ub: 0 },
  });
  constraints.push({
    name: "day_cals_upper",
    vars: varNames,
    coefs: calorieCoeffs,
    bnds: { type: glpk.GLP_UP, lb: 0, ub: calorieUpperBound },
  });
  constraints.push({
    name: "day_protein_lower",
    vars: varNames,
    coefs: proteinCoeffs,
    bnds: { type: glpk.GLP_LO, lb: proteinLowerBound, ub: 0 },
  });
  constraints.push({
    name: "day_protein_upper",
    vars: varNames,
    coefs: proteinCoeffs,
    bnds: { type: glpk.GLP_UP, lb: 0, ub: proteinUpperBound },
  });

  console.log("Added main calorie/protein constraints (with upper bounds)");

  // Proportional calorie constraint for each unlocked meal
  const basePercent = 1 / unlockedMeals.length;
  const lowerPercent = Math.max(0, basePercent - PER_MEAL_PROPORTION_TOLERANCE);
  const upperPercent = Math.min(
    1.1,
    basePercent + PER_MEAL_PROPORTION_TOLERANCE
  );

  console.log(`\n--- PER-MEAL PROPORTIONAL CONSTRAINTS ---`);
  console.log(`Base percent per meal: ${basePercent}`);
  console.log(
    `Range: ${lowerPercent} to ${upperPercent} (±${PER_MEAL_PROPORTION_TOLERANCE} tolerance)`
  );

  unlockedMeals.forEach((meal, mIdx) => {
    const sIdx = varNames.indexOf(`s_${mIdx}`);
    const mpIdx = varNames.indexOf(`mp_${mIdx}`);

    let nonMainCal = 0;
    let mainProtCalTotal = 0;

    meal.ingredients.forEach((ing) => {
      if (!ing.grams) return;

      const calculatedCalPerGram =
        ing.calories_per_gram ?? (ing.calories ?? 0) / (ing.grams ?? 1);

      if (ing.mainProtein === 1) {
        mainProtCalTotal += (ing.grams ?? 0) * calculatedCalPerGram;
      } else {
        nonMainCal += (ing.grams ?? 0) * calculatedCalPerGram;
      }
    });

    const mealCalorieLower = lowerPercent * remainingCalories;
    const mealCalorieUpper = upperPercent * remainingCalories;

    console.log(
      `Meal ${mIdx} (${meal.name}): ${mealCalorieLower.toFixed(
        1
      )} ≤ calories ≤ ${mealCalorieUpper.toFixed(1)}`
    );

    // Build coefficient array for all vars
    const coefArr = Array(varNames.length).fill(0);
    if (sIdx !== -1) coefArr[sIdx] = nonMainCal;
    if (mpIdx !== -1) coefArr[mpIdx] = mainProtCalTotal;

    // Use remaining calories for proportional constraints
    // Lower bound
    constraints.push({
      name: `meal_${mIdx}_cals_lower`,
      vars: varNames,
      coefs: coefArr,
      bnds: { type: glpk.GLP_LO, lb: mealCalorieLower, ub: 0 },
    });
    // Upper bound
    constraints.push({
      name: `meal_${mIdx}_cals_upper`,
      vars: varNames,
      coefs: coefArr,
      bnds: { type: glpk.GLP_UP, lb: 0, ub: mealCalorieUpper },
    });
  });

  // For each unlocked meal, add main protein percentage constraint
  unlockedMeals.forEach((meal, mIdx) => {
    const mpIdx = varNames.indexOf(`mp_${mIdx}`);
    const sIdx = varNames.indexOf(`s_${mIdx}`);

    // Calculate main protein total and non-main-protein total per unit scale
    let mainProtProtTotal = 0;
    let nonMainProtTotal = 0;

    meal.ingredients.forEach((ing) => {
      if (!ing.grams) return;

      const calculatedProtPerGram =
        ing.protein_per_gram ?? (ing.protein ?? 0) / (ing.grams ?? 1);

      if (ing.mainProtein === 1) {
        mainProtProtTotal += (ing.grams ?? 0) * calculatedProtPerGram;
      } else {
        nonMainProtTotal += (ing.grams ?? 0) * calculatedProtPerGram;
      }
    });

    // Calculate coefficient for the constraint: mainProtein ≥ percentage * (mainProtein + nonMainProtein)
    // Rearranged: (1 - percentage) * mainProtein ≥ percentage * nonMainProtein
    // Or: mainProtein - percentage * mainProtein ≥ percentage * nonMainProtein
    // Or: mainProtein ≥ (percentage / (1 - percentage)) * nonMainProtein
    const coefficientMultiplier =
      MAIN_PROTEIN_PERCENTAGE_REQUIREMENT /
      (1 - MAIN_PROTEIN_PERCENTAGE_REQUIREMENT);

    // Build coefficient array for all vars
    const coefArr = Array(varNames.length).fill(0);
    if (mpIdx !== -1) coefArr[mpIdx] = mainProtProtTotal;
    if (sIdx !== -1) coefArr[sIdx] = -coefficientMultiplier * nonMainProtTotal;

    console.log(
      `\nMeal ${mIdx} main protein constraint (${(
        MAIN_PROTEIN_PERCENTAGE_REQUIREMENT * 100
      ).toFixed(0)}% requirement):`
    );
    console.log(`  Main protein total: ${mainProtProtTotal.toFixed(1)}g`);
    console.log(`  Non-main protein total: ${nonMainProtTotal.toFixed(1)}g`);
    console.log(
      `  Coefficient multiplier: ${coefficientMultiplier.toFixed(2)}`
    );
    console.log(
      `  Constraint: ${mainProtProtTotal.toFixed(1)} * mp_${mIdx} + (${(
        -coefficientMultiplier * nonMainProtTotal
      ).toFixed(1)}) * s_${mIdx} ≥ 0`
    );

    constraints.push({
      name: `main_protein_${(MAIN_PROTEIN_PERCENTAGE_REQUIREMENT * 100).toFixed(
        0
      )}pct_meal_${mIdx}`,
      vars: varNames,
      coefs: coefArr,
      bnds: { type: glpk.GLP_LO, lb: 0, ub: 0 }, // ≥ 0
    });
  });

  console.log(`\nAdded ${constraints.length} total constraints`);

  // ---------- 3. Variable bounds ----------
  const bounds: GLPKBound[] = [];
  varNames.forEach((v) => {
    if (nonProteinVars.includes(v)) {
      bounds.push({
        name: v,
        type: glpk.GLP_LO,
        lb: scalingBounds[v]?.lb ?? 0,
        ub: scalingBounds[v]?.ub ?? 100,
      });
    }
    if (mainProteinVars.includes(v)) {
      bounds.push({
        name: v,
        type: glpk.GLP_LO,
        lb: mainProteinBounds[v]?.lb ?? 0,
        ub: mainProteinBounds[v]?.ub ?? 10,
      });
    }
  });

  console.log(`Added ${bounds.length} variable bounds`);

  // ---------- 4. Objective ----------
  const objective = Array(varNames.length).fill(1);

  // ---------- 5. Build GLPK problem ----------
  const glpkProblem = {
    name: "dayPlan",
    objective: {
      direction: glpk.GLP_MIN,
      name: "totalScaling",
      vars: varNames.map((v, i) => ({ name: v, coef: objective[i] })),
    },
    subjectTo: constraints.map((c) => ({
      name: c.name,
      vars: c.vars.map((v, i) => ({ name: v, coef: c.coefs[i] })),
      bnds: c.bnds,
    })),
    bounds: bounds,
  };

  console.log("\n--- SOLVING OPTIMIZATION PROBLEM ---");

  // ---------- 6. Solve ----------
  const solveOutput = (await glpk.solve(glpkProblem, {
    msglev: 0,
  })) as GLPKSolveResult;

  if (!solveOutput || !solveOutput.result) {
    console.log("❌ No solve output");
    return {
      meals: [],
      dayCalories: 0,
      dayProtein: 0,
      valid: false,
    };
  }

  const { result } = solveOutput;
  const vars = result?.vars || {};

  console.log("Solver status:", result.status);
  console.log("GLPK status constants:", {
    GLP_OPT: glpk.GLP_OPT,
    GLP_FEAS: glpk.GLP_FEAS,
    GLP_INFEAS: glpk.GLP_INFEAS,
    GLP_NOFEAS: glpk.GLP_NOFEAS,
    GLP_UNBND: glpk.GLP_UNBND,
    GLP_UNDEF: glpk.GLP_UNDEF,
  });

  if (result.status !== glpk.GLP_OPT && result.status !== glpk.GLP_FEAS) {
    console.log(`❌ No feasible solution found (status: ${result.status})`);
    console.log("This might indicate over-constrained problem. Consider:");
    console.log("- Relaxing calorie/protein tolerances");
    console.log("- Adjusting per-meal proportion ranges");
    console.log("- Checking if meals can physically meet targets");
    return {
      meals: [],
      dayCalories: 0,
      dayProtein: 0,
      valid: false,
    };
  }

  console.log("\n--- SOLUTION VARIABLES ---");
  Object.entries(vars).forEach(([varName, value]) => {
    console.log(`${varName} = ${value}`);
  });

  // ---------- 7. Build PortionedMeals for unlocked meals ----------
  console.log("\n--- BUILDING PORTIONED MEALS ---");

  const newPortionedMeals: PortionedMeal[] = [];
  let newMealCalories = 0;
  let newMealProtein = 0;

  unlockedMeals.forEach((meal, mIdx) => {
    console.log(`\n--- BUILDING MEAL ${mIdx}: ${meal.name} ---`);

    const sVar = `s_${mIdx}`;
    const mpVar = `mp_${mIdx}`;
    const scale = vars[sVar] ?? 1;
    const mainProteinMultiplier = vars[mpVar] ?? 1;

    console.log(`Scale (${sVar}): ${scale}`);
    console.log(`Main protein multiplier (${mpVar}): ${mainProteinMultiplier}`);

    const portionedIngredients: MealIngredient[] = [];
    let mealCalories = 0;
    let mealProtein = 0;

    meal.ingredients.forEach((ing, ingIdx) => {
      console.log(`  Processing ingredient ${ingIdx}: ${ing.name}`);

      let grams = 0;
      if (ing.mainProtein === 1) {
        grams = (ing.grams ?? 0) * mainProteinMultiplier;
        console.log(
          `    Main protein: ${ing.grams} * ${mainProteinMultiplier} = ${grams}g`
        );
      } else {
        grams = (ing.grams ?? 0) * scale;
        console.log(`    Non-main: ${ing.grams} * ${scale} = ${grams}g`);
      }

      const protein_per_gram =
        ing.protein_per_gram ??
        (ing.protein !== undefined && ing.grams ? ing.protein / ing.grams : 0);
      const calories_per_gram =
        ing.calories_per_gram ??
        (ing.calories !== undefined && ing.grams
          ? ing.calories / ing.grams
          : 0);

      const protein = grams * protein_per_gram;
      const calories = grams * calories_per_gram;

      console.log(
        `    Final: ${grams}g → ${calories.toFixed(1)} cal, ${protein.toFixed(
          1
        )}g protein`
      );

      // --- Convert grams back to amount using grams_per_unit ---
      let newAmount = ing.amount;
      if (ing.grams_per_unit && ing.recommended_unit) {
        const units = grams / ing.grams_per_unit;
        const displayUnits =
          Math.abs(Math.round(units) - units) < 0.05
            ? Math.round(units).toString()
            : units.toFixed(2);
        newAmount = `${displayUnits} ${ing.recommended_unit}`;
      }

      mealCalories += calories;
      mealProtein += protein;

      portionedIngredients.push({
        ...ing,
        grams,
        amount: newAmount,
        protein_per_gram,
        calories_per_gram,
        protein,
        calories,
      });
    });

    console.log(
      `  Meal totals: ${mealCalories.toFixed(1)} cal, ${mealProtein.toFixed(
        1
      )}g protein`
    );

    newPortionedMeals.push({
      mealId: meal.id,
      mealName: meal.name,
      ingredients: portionedIngredients,
      totalCalories: mealCalories,
      totalProtein: mealProtein,
    });

    newMealCalories += mealCalories;
    newMealProtein += mealProtein;
  });

  console.log(
    `\nNew meals total: ${newMealCalories.toFixed(
      1
    )} cal, ${newMealProtein.toFixed(1)}g protein`
  );

  // ---------- 8. Rebuild meals in original order ----------
  const finalMeals: PortionedMeal[] = [];
  let newMealIndex = 0;

  for (const status of mealStatus) {
    if (status.isLocked) {
      // Use the locked portion
      finalMeals.push(status.lockedPortion!);
    } else {
      // Use the newly solved portion
      finalMeals.push(newPortionedMeals[newMealIndex]);
      newMealIndex++;
    }
  }

  const totalDayCalories = lockedCalories + newMealCalories;
  const totalDayProtein = lockedProtein + newMealProtein;

  console.log("\n--- FINAL VERIFICATION ---");
  console.log(
    `Total day calories: ${lockedCalories} (locked) + ${newMealCalories} (new) = ${totalDayCalories}`
  );
  console.log(
    `Total day protein: ${lockedProtein} (locked) + ${newMealProtein} (new) = ${totalDayProtein}`
  );
  console.log(`Target was: ${targetCalories} cal, ${targetProtein}g protein`);
  console.log(
    `Allowed range: ${targetCalories - CALORIE_TOLERANCE_LOWER} to ${
      targetCalories + CALORIE_TOLERANCE_UPPER
    } cal, ${targetProtein - PROTEIN_TOLERANCE_LOWER} to ${
      targetProtein + PROTEIN_TOLERANCE_UPPER
    }g protein`
  );

  const withinCalorieRange =
    Math.round(totalDayCalories * 1000) / 1000 >=
      targetCalories - CALORIE_TOLERANCE_LOWER &&
    Math.round(totalDayCalories * 1000) / 1000 <=
      targetCalories + CALORIE_TOLERANCE_UPPER;
  const withinProteinRange =
    Math.round(totalDayProtein * 1000) / 1000 >=
      targetProtein - PROTEIN_TOLERANCE_LOWER &&
    Math.round(totalDayProtein * 1000) / 1000 <=
      targetProtein + PROTEIN_TOLERANCE_UPPER;

  console.log(`Within calorie range: ${withinCalorieRange}`);
  console.log(`Within protein range: ${withinProteinRange}`);

  if (!withinCalorieRange) {
    console.log("⚠️  WARNING: Final result is outside allowed calorie range!");
  }

  // MANUAL VERIFICATION: Calculate what the constraints should have enforced
  console.log("\n--- MANUAL CONSTRAINT VERIFICATION ---");
  let manualCalTotal = 0;
  let manualProtTotal = 0;

  Object.entries(vars).forEach(([varName, value]) => {
    const varIndex = varNames.indexOf(varName);
    if (varIndex !== -1) {
      const calContrib = calorieCoeffs[varIndex] * value;
      const protContrib = proteinCoeffs[varIndex] * value;
      manualCalTotal += calContrib;
      manualProtTotal += protContrib;
      console.log(
        `${varName} = ${value.toFixed(3)} → +${calContrib.toFixed(
          1
        )} cal, +${protContrib.toFixed(1)}g prot`
      );
    }
  });

  console.log(
    `Manual constraint calculation: ${manualCalTotal.toFixed(
      1
    )} cal, ${manualProtTotal.toFixed(1)}g protein`
  );
  console.log(
    `Should match new meal totals: ${newMealCalories.toFixed(
      1
    )} cal, ${newMealProtein.toFixed(1)}g protein`
  );

  if (Math.abs(manualCalTotal - newMealCalories) > 1) {
    console.log(
      "🚨 DISCREPANCY: Manual calculation doesn't match meal totals!"
    );
  } else {
    console.log("✅ Manual calculation matches meal totals!");
  }

  return {
    meals: finalMeals,
    dayCalories: totalDayCalories,
    dayProtein: totalDayProtein,
    valid: withinCalorieRange && withinProteinRange,
  };
}
