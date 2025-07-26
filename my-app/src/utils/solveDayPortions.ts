import initGLPK, { GLPK } from "glpk.js";
import { Meal, MealIngredient } from "../lib/store";

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

  // If all meals are locked, just return them in original order
  if (unlockedMeals.length === 0) {
    const orderedLockedMeals = mealStatus.map(
      (status) => status.lockedPortion!
    );
    return {
      meals: orderedLockedMeals,
      dayCalories: lockedCalories,
      dayProtein: lockedProtein,
      valid: true,
    };
  }

  // Adjust targets for remaining unlocked meals
  const remainingCalories = targetCalories - lockedCalories;
  const remainingProtein = targetProtein - lockedProtein;

  // If locked portions already exceed targets, this day is invalid
  if (remainingCalories < 0 || remainingProtein < 0) {
    return {
      meals: [],
      dayCalories: 0,
      dayProtein: 0,
      valid: false,
    };
  }

  const mealsPerDay = unlockedMeals.length;

  // ------ 1. Build variables for unlocked meals only ------
  const varNames: string[] = [];
  const nonProteinVars: string[] = [];
  const mainProteinVars: string[] = [];

  // Map for ingredient type and bounds
  const mainProteinBounds: { [key: string]: { lb: number; ub: number } } = {};
  const scalingBounds: { [key: string]: { lb: number; ub: number } } = {};

  unlockedMeals.forEach((meal, mIdx) => {
    // --- Scaling variable for non-mainProtein ---
    const sVar = `s_${mIdx}`;
    varNames.push(sVar);
    nonProteinVars.push(sVar);
    scalingBounds[sVar] = { lb: 0, ub: 100 };

    // --- Find main protein ingredient ---
    const mainProtIdx = meal.ingredients.findIndex(
      (ing) => ing.mainProtein === 1
    );
    if (mainProtIdx !== -1) {
      const qVar = `q_${mIdx}`; // independent main protein grams
      varNames.push(qVar);
      mainProteinVars.push(qVar);

      // Reasonable lower/upper bounds: [0, 1000g]
      mainProteinBounds[qVar] = { lb: 0, ub: 1000 };
    }
  });

  // ---------- 2. Build constraints ----------
  const constraints: GLPKConstraint[] = [];

  // --- (a) Day calorie/protein totals (adjusted for locked portions) ---
  const calorieCoeffs = Array(varNames.length).fill(0);
  const proteinCoeffs = Array(varNames.length).fill(0);

  unlockedMeals.forEach((meal, mIdx) => {
    const sIdx = varNames.indexOf(`s_${mIdx}`);
    const qIdx = varNames.indexOf(`q_${mIdx}`);

    let nonMainCal = 0;
    let nonMainProt = 0;
    let mainProtCalPerGram = 0;
    let mainProtProtPerGram = 0;

    meal.ingredients.forEach((ing) => {
      if (!ing.grams) return;
      if (ing.mainProtein === 1) {
        mainProtCalPerGram =
          ing.calories_per_gram ?? (ing.calories ?? 0) / (ing.grams ?? 1);
        mainProtProtPerGram =
          ing.protein_per_gram ?? (ing.protein ?? 0) / (ing.grams ?? 1);
      } else {
        nonMainCal +=
          (ing.grams ?? 0) *
          (ing.calories_per_gram ?? (ing.calories ?? 0) / (ing.grams ?? 1));
        nonMainProt +=
          (ing.grams ?? 0) *
          (ing.protein_per_gram ?? (ing.protein ?? 0) / (ing.grams ?? 1));
      }
    });

    if (sIdx !== -1) {
      calorieCoeffs[sIdx] = nonMainCal;
      proteinCoeffs[sIdx] = nonMainProt;
    }
    if (qIdx !== -1) {
      calorieCoeffs[qIdx] = mainProtCalPerGram;
      proteinCoeffs[qIdx] = mainProtProtPerGram;
    }
  });

  // Use remaining targets instead of full targets
  constraints.push({
    name: "day_cals_lower",
    vars: varNames,
    coefs: calorieCoeffs,
    bnds: { type: glpk.GLP_LO, lb: remainingCalories - 100, ub: 0 },
  });
  constraints.push({
    name: "day_cals_upper",
    vars: varNames,
    coefs: calorieCoeffs,
    bnds: { type: glpk.GLP_UP, lb: 0, ub: remainingCalories + 100 },
  });
  constraints.push({
    name: "day_protein_lower",
    vars: varNames,
    coefs: proteinCoeffs,
    bnds: { type: glpk.GLP_LO, lb: remainingProtein - 10, ub: 0 },
  });

  // Proportional calorie constraint for each unlocked meal
  // Note: We need to adjust this since we're only considering unlocked meals
  const basePercent = 1 / unlockedMeals.length;
  const lowerPercent = Math.max(0, basePercent - 0.1);
  const upperPercent = Math.min(1, basePercent + 0.1);

  unlockedMeals.forEach((meal, mIdx) => {
    const sIdx = varNames.indexOf(`s_${mIdx}`);
    const qIdx = varNames.indexOf(`q_${mIdx}`);

    let nonMainCal = 0;
    let mainProtCalPerGram = 0;

    meal.ingredients.forEach((ing) => {
      if (ing.mainProtein === 1) {
        mainProtCalPerGram =
          ing.calories_per_gram ?? (ing.calories ?? 0) / (ing.grams ?? 1);
      } else {
        nonMainCal +=
          (ing.grams ?? 0) *
          (ing.calories_per_gram ?? (ing.calories ?? 0) / (ing.grams ?? 1));
      }
    });

    // Build coefficient array for all vars
    const coefArr = Array(varNames.length).fill(0);
    if (sIdx !== -1) coefArr[sIdx] = nonMainCal;
    if (qIdx !== -1) coefArr[qIdx] = mainProtCalPerGram;

    // Use remaining calories for proportional constraints
    // Lower bound
    constraints.push({
      name: `meal_${mIdx}_cals_lower`,
      vars: varNames,
      coefs: coefArr,
      bnds: { type: glpk.GLP_LO, lb: lowerPercent * remainingCalories, ub: 0 },
    });
    // Upper bound
    constraints.push({
      name: `meal_${mIdx}_cals_upper`,
      vars: varNames,
      coefs: coefArr,
      bnds: { type: glpk.GLP_UP, lb: 0, ub: upperPercent * remainingCalories },
    });
  });

  // For each unlocked meal, add "main protein ≥ 75% of total protein" constraint
  unlockedMeals.forEach((meal, mIdx) => {
    const qIdx = varNames.indexOf(`q_${mIdx}`);
    const sIdx = varNames.indexOf(`s_${mIdx}`);

    // Calculate main protein per gram and non-main-protein total per unit scale
    let mainProtProteinPerGram = 0;
    let nonMainProtTotal = 0;

    meal.ingredients.forEach((ing) => {
      if (ing.mainProtein === 1) {
        mainProtProteinPerGram =
          ing.protein_per_gram ?? (ing.protein ?? 0) / (ing.grams ?? 1);
      } else {
        nonMainProtTotal +=
          (ing.grams ?? 0) *
          (ing.protein_per_gram ?? (ing.protein ?? 0) / (ing.grams ?? 1));
      }
    });

    // Build coefficient array for all vars
    const coefArr = Array(varNames.length).fill(0);
    if (qIdx !== -1) coefArr[qIdx] = mainProtProteinPerGram;
    if (sIdx !== -1) coefArr[sIdx] = -1.9 * nonMainProtTotal;

    constraints.push({
      name: `main_protein_75pct_meal_${mIdx}`,
      vars: varNames,
      coefs: coefArr,
      bnds: { type: glpk.GLP_LO, lb: 0, ub: 0 }, // ≥ 0
    });
  });

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
        ub: mainProteinBounds[v]?.ub ?? 1000,
      });
    }
  });

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

  // ---------- 6. Solve ----------
  const solveOutput = (await glpk.solve(glpkProblem, {
    msglev: 0,
  })) as GLPKSolveResult;

  if (!solveOutput || !solveOutput.result) {
    return {
      meals: [],
      dayCalories: 0,
      dayProtein: 0,
      valid: false,
    };
  }

  const { result } = solveOutput;
  const vars = result?.vars || {};

  if (result.status !== glpk.GLP_OPT && result.status !== glpk.GLP_FEAS) {
    // No solution
    return {
      meals: [],
      dayCalories: 0,
      dayProtein: 0,
      valid: false,
    };
  }

  // ---------- 7. Build PortionedMeals for unlocked meals ----------
  const newPortionedMeals: PortionedMeal[] = [];
  let newMealCalories = 0;
  let newMealProtein = 0;

  unlockedMeals.forEach((meal, mIdx) => {
    const sVar = `s_${mIdx}`;
    const qVar = `q_${mIdx}`;
    const scale = vars[sVar] ?? 1;
    const mainProteinGrams = vars[qVar] ?? 0;
    const portionedIngredients: MealIngredient[] = [];
    let mealCalories = 0;
    let mealProtein = 0;

    meal.ingredients.forEach((ing) => {
      let grams = 0;
      if (ing.mainProtein === 1) {
        grams = mainProteinGrams;
      } else {
        grams = (ing.grams ?? 0) * scale;
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

  return {
    meals: finalMeals,
    dayCalories: totalDayCalories,
    dayProtein: totalDayProtein,
    valid: true,
  };
}
