import sys
import json
import traceback
from pyomo.environ import *
from itertools import combinations

def log(msg):
    print(f"[solver.py] {msg}", file=sys.stderr)

def generate_optimized_days(meals_input, ingredient_macros, meals_per_day, target_calories, target_protein):
    log("🔹 Starting optimization function")
    
    # Log input parameters
    log(f"📊 Input parameters:")
    log(f"   - Meals count: {len(meals_input)}")
    log(f"   - Ingredient macros count: {len(ingredient_macros)}")
    log(f"   - Meals per day: {meals_per_day}")
    log(f"   - Target calories: {target_calories}")
    log(f"   - Target protein: {target_protein}")
    
    # Log meal names for debugging
    meal_names = [meal["name"] for meal in meals_input]
    log(f"   - Meal names: {meal_names}")
    
    calorie_slack = 100
    protein_slack = 10
    BIG_M = 10000

    avg_meal_calories = target_calories / meals_per_day
    meal_min_pct = 0.7
    meal_max_pct = 1.3
    meal_min_calories = avg_meal_calories * meal_min_pct
    meal_max_calories = avg_meal_calories * meal_max_pct

    log(f"🎯 Calculated meal constraints:")
    log(f"   - Avg meal calories: {avg_meal_calories}")
    log(f"   - Meal min calories: {meal_min_calories}")
    log(f"   - Meal max calories: {meal_max_calories}")

    meal_protein_min_pct = 0.15
    meal_protein_max_pct = 0.35
    calories_per_gram_protein = 4

    meals = [meal["name"] for meal in meals_input]
    
    # Separate ingredients by type and calculate fixed contributions
    ingredients = {}
    fixed_ingredients = {}
    scalable_ingredients = {}
    fixed_meal_calories = {}
    fixed_meal_protein = {}
    
    log("🔍 Processing meals and ingredients...")
    
    for meal in meals_input:
        meal_name = meal["name"]
        log(f"   Processing meal: {meal_name}")
        
        ingredients[meal_name] = [ing["name"] for ing in meal["ingredients"]]
        fixed_ingredients[meal_name] = []
        scalable_ingredients[meal_name] = []
        fixed_meal_calories[meal_name] = 0
        fixed_meal_protein[meal_name] = 0
        
        for ing in meal["ingredients"]:
            ing_name = ing["name"]
            log(f"     - Ingredient: {ing_name}, main: {ing['main']}, grams: {ing.get('grams', 'N/A')}")
            
            # Check if ingredient exists in macros
            if ing_name not in ingredient_macros:
                log(f"❌ ERROR: Ingredient '{ing_name}' not found in ingredient_macros!")
                raise ValueError(f"Ingredient '{ing_name}' not found in ingredient_macros")
            
            if ing["main"] == 0:  # Fixed ingredient
                fixed_ingredients[meal_name].append(ing_name)
                grams = ing["grams"]
                calories = grams * ingredient_macros[ing_name]['calories_per_gram']
                protein = grams * ingredient_macros[ing_name]['protein_per_gram']
                fixed_meal_calories[meal_name] += calories
                fixed_meal_protein[meal_name] += protein
                log(f"       Fixed: {grams}g -> {calories:.1f} cal, {protein:.1f}g protein")
            else:  # Scalable ingredient
                scalable_ingredients[meal_name].append(ing_name)
                log(f"       Scalable ingredient added")
        
        log(f"   Meal '{meal_name}' totals - Fixed: {fixed_meal_calories[meal_name]:.1f} cal, {fixed_meal_protein[meal_name]:.1f}g protein")
        log(f"   Scalable ingredients: {scalable_ingredients[meal_name]}")

    # Generate combinations
    log("🔢 Generating meal combinations...")
    all_combinations = list(combinations(meals, meals_per_day))
    log(f"   Total combinations: {len(all_combinations)}")
    
    if len(all_combinations) == 0:
        log("❌ ERROR: No meal combinations generated!")
        raise ValueError("No meal combinations possible")
    
    # Log first few combinations for debugging
    for i, combo in enumerate(all_combinations[:5]):
        log(f"   Combo {i}: {combo}")
    
    all_scalable_ingredients = list(set(i for m in meals for i in scalable_ingredients[m]))
    log(f"   All scalable ingredients: {all_scalable_ingredients}")

    # Create model
    log("🏗️ Creating Pyomo model...")
    model = ConcreteModel()
    
    try:
        model.MEALS = Set(initialize=meals)
        model.COMBINATIONS = Set(initialize=range(len(all_combinations)))
        model.SCALABLE_INGREDIENTS = Set(initialize=all_scalable_ingredients)
        model.POSITIONS = Set(initialize=range(meals_per_day))
        log("   Sets created successfully")
    except Exception as e:
        log(f"❌ ERROR creating sets: {e}")
        raise

    # Create variables
    log("📊 Creating decision variables...")
    try:
        model.meal_portions = Var(model.MEALS, model.SCALABLE_INGREDIENTS, domain=NonNegativeReals)
        model.meal_used = Var(model.MEALS, domain=Binary)
        model.meal_position = Var(model.MEALS, model.POSITIONS, domain=Binary)
        model.combination_valid = Var(model.COMBINATIONS, domain=Binary)
        log("   Variables created successfully")
    except Exception as e:
        log(f"❌ ERROR creating variables: {e}")
        raise

    # Add constraints
    log("🔗 Adding constraints...")
    
    def meal_portion_bounds(model, m, i):
        if i not in scalable_ingredients[m]:
            return model.meal_portions[m, i] == 0
        return model.meal_portions[m, i] <= 500 * model.meal_used[m]
    
    try:
        model.MealPortionBounds = Constraint(model.MEALS, model.SCALABLE_INGREDIENTS, rule=meal_portion_bounds)
        log("   MealPortionBounds constraint added")
    except Exception as e:
        log(f"❌ ERROR adding MealPortionBounds: {e}")
        raise

    def meal_ingredient_consistency(model, m, i):
        if i not in scalable_ingredients[m]:
            return Constraint.Skip
        return model.meal_portions[m, i] >= 5 * model.meal_used[m]
    
    try:
        model.MealIngredientConsistency = Constraint(model.MEALS, model.SCALABLE_INGREDIENTS, rule=meal_ingredient_consistency)
        log("   MealIngredientConsistency constraint added")
    except Exception as e:
        log(f"❌ ERROR adding MealIngredientConsistency: {e}")
        raise

    def meal_single_position(model, m):
        return sum(model.meal_position[m, p] for p in model.POSITIONS) <= 1
    
    try:
        model.MealSinglePosition = Constraint(model.MEALS, rule=meal_single_position)
        log("   MealSinglePosition constraint added")
    except Exception as e:
        log(f"❌ ERROR adding MealSinglePosition: {e}")
        raise

    def meal_used_iff_positioned(model, m):
        return model.meal_used[m] == sum(model.meal_position[m, p] for p in model.POSITIONS)
    
    try:
        model.MealUsedIffPositioned = Constraint(model.MEALS, rule=meal_used_iff_positioned)
        log("   MealUsedIffPositioned constraint added")
    except Exception as e:
        log(f"❌ ERROR adding MealUsedIffPositioned: {e}")
        raise

    def meal_calorie_lower(model, m):
        try:
            scalable_calories = sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in scalable_ingredients[m])
            total_calories = scalable_calories + fixed_meal_calories[m] * model.meal_used[m]
            return total_calories >= meal_min_calories * model.meal_used[m]
        except Exception as e:
            log(f"❌ ERROR in meal_calorie_lower for meal {m}: {e}")
            raise
    
    try:
        model.MealCalorieLower = Constraint(model.MEALS, rule=meal_calorie_lower)
        log("   MealCalorieLower constraint added")
    except Exception as e:
        log(f"❌ ERROR adding MealCalorieLower: {e}")
        raise

    def meal_calorie_upper(model, m):
        try:
            scalable_calories = sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in scalable_ingredients[m])
            total_calories = scalable_calories + fixed_meal_calories[m] * model.meal_used[m]
            return total_calories <= meal_max_calories * model.meal_used[m]
        except Exception as e:
            log(f"❌ ERROR in meal_calorie_upper for meal {m}: {e}")
            raise
    
    try:
        model.MealCalorieUpper = Constraint(model.MEALS, rule=meal_calorie_upper)
        log("   MealCalorieUpper constraint added")
    except Exception as e:
        log(f"❌ ERROR adding MealCalorieUpper: {e}")
        raise

    def meal_protein_balance_lower(model, m):
        try:
            scalable_calories = sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in scalable_ingredients[m])
            scalable_protein = sum(model.meal_portions[m, i] * ingredient_macros[i]['protein_per_gram'] for i in scalable_ingredients[m])
            
            total_calories = scalable_calories + fixed_meal_calories[m] * model.meal_used[m]
            total_protein = scalable_protein + fixed_meal_protein[m] * model.meal_used[m]
            
            return total_protein * calories_per_gram_protein >= total_calories * meal_protein_min_pct
        except Exception as e:
            log(f"❌ ERROR in meal_protein_balance_lower for meal {m}: {e}")
            raise
    
    try:
        model.MealProteinBalanceLower = Constraint(model.MEALS, rule=meal_protein_balance_lower)
        log("   MealProteinBalanceLower constraint added")
    except Exception as e:
        log(f"❌ ERROR adding MealProteinBalanceLower: {e}")
        raise

    def meal_protein_balance_upper(model, m):
        try:
            scalable_calories = sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in scalable_ingredients[m])
            scalable_protein = sum(model.meal_portions[m, i] * ingredient_macros[i]['protein_per_gram'] for i in scalable_ingredients[m])
            
            total_calories = scalable_calories + fixed_meal_calories[m] * model.meal_used[m]
            total_protein = scalable_protein + fixed_meal_protein[m] * model.meal_used[m]
            
            return total_protein * calories_per_gram_protein <= total_calories * meal_protein_max_pct
        except Exception as e:
            log(f"❌ ERROR in meal_protein_balance_upper for meal {m}: {e}")
            raise
    
    try:
        model.MealProteinBalanceUpper = Constraint(model.MEALS, rule=meal_protein_balance_upper)
        log("   MealProteinBalanceUpper constraint added")
    except Exception as e:
        log(f"❌ ERROR adding MealProteinBalanceUpper: {e}")
        raise

    log("   Adding combination constraints...")
    try:
        model.CombinationPositionConsistency = ConstraintList()
        for c in model.COMBINATIONS:
            combo_meals = all_combinations[c]
            for pos in range(meals_per_day):
                meal_at_pos = combo_meals[pos]
                model.CombinationPositionConsistency.add(model.combination_valid[c] <= model.meal_position[meal_at_pos, pos])
        log("   CombinationPositionConsistency constraints added")
    except Exception as e:
        log(f"❌ ERROR adding CombinationPositionConsistency: {e}")
        raise

    def combination_calorie_lower(model, c):
        try:
            combo_meals = all_combinations[c]
            total_calories = sum(
                sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in scalable_ingredients[m]) +
                fixed_meal_calories[m] * model.meal_used[m]
                for m in combo_meals
            )
            return total_calories >= (target_calories - calorie_slack) * model.combination_valid[c]
        except Exception as e:
            log(f"❌ ERROR in combination_calorie_lower for combination {c}: {e}")
            raise
    
    try:
        model.CombinationCalorieLower = Constraint(model.COMBINATIONS, rule=combination_calorie_lower)
        log("   CombinationCalorieLower constraint added")
    except Exception as e:
        log(f"❌ ERROR adding CombinationCalorieLower: {e}")
        raise

    def combination_calorie_upper(model, c):
        try:
            combo_meals = all_combinations[c]
            total_calories = sum(
                sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in scalable_ingredients[m]) +
                fixed_meal_calories[m] * model.meal_used[m]
                for m in combo_meals
            )
            return total_calories <= (target_calories + calorie_slack) * model.combination_valid[c] + BIG_M * (1 - model.combination_valid[c])
        except Exception as e:
            log(f"❌ ERROR in combination_calorie_upper for combination {c}: {e}")
            raise
    
    try:
        model.CombinationCalorieUpper = Constraint(model.COMBINATIONS, rule=combination_calorie_upper)
        log("   CombinationCalorieUpper constraint added")
    except Exception as e:
        log(f"❌ ERROR adding CombinationCalorieUpper: {e}")
        raise

    def combination_protein_lower(model, c):
        try:
            combo_meals = all_combinations[c]
            total_protein = sum(
                sum(model.meal_portions[m, i] * ingredient_macros[i]['protein_per_gram'] for i in scalable_ingredients[m]) +
                fixed_meal_protein[m] * model.meal_used[m]
                for m in combo_meals
            )
            return total_protein >= (target_protein - protein_slack) * model.combination_valid[c]
        except Exception as e:
            log(f"❌ ERROR in combination_protein_lower for combination {c}: {e}")
            raise
    
    try:
        model.CombinationProteinLower = Constraint(model.COMBINATIONS, rule=combination_protein_lower)
        log("   CombinationProteinLower constraint added")
    except Exception as e:
        log(f"❌ ERROR adding CombinationProteinLower: {e}")
        raise

    def combination_protein_upper(model, c):
        try:
            combo_meals = all_combinations[c]
            total_protein = sum(
                sum(model.meal_portions[m, i] * ingredient_macros[i]['protein_per_gram'] for i in scalable_ingredients[m]) +
                fixed_meal_protein[m] * model.meal_used[m]
                for m in combo_meals
            )
            return total_protein <= (target_protein + protein_slack) * model.combination_valid[c] + BIG_M * (1 - model.combination_valid[c])
        except Exception as e:
            log(f"❌ ERROR in combination_protein_upper for combination {c}: {e}")
            raise
    
    try:
        model.CombinationProteinUpper = Constraint(model.COMBINATIONS, rule=combination_protein_upper)
        log("   CombinationProteinUpper constraint added")
    except Exception as e:
        log(f"❌ ERROR adding CombinationProteinUpper: {e}")
        raise

    # Set objective
    log("🎯 Setting objective...")
    try:
        model.Objective = Objective(expr=sum(model.combination_valid[c] for c in model.COMBINATIONS), sense=maximize)
        log("   Objective set successfully")
    except Exception as e:
        log(f"❌ ERROR setting objective: {e}")
        raise

    # Solve the model
    log("🚀 Starting solver...")
    try:
        solver = SolverFactory('cbc')
        log("   CBC solver factory created")
        
        result = solver.solve(model, tee=False)
        log(f"   Solver finished with status: {result.solver.termination_condition}")
        log(f"   Solver return code: {result.solver.return_code}")
        
        if hasattr(result.solver, 'message'):
            log(f"   Solver message: {result.solver.message}")
            
    except Exception as e:
        log(f"❌ ERROR during solving: {e}")
        raise

    # Process results
    log("📊 Processing results...")
    
    try:
        objective_value = model.Objective()
        log(f"   Objective value: {objective_value}")
    except Exception as e:
        log(f"❌ ERROR getting objective value: {e}")
        objective_value = 0

    output = {
        "status": str(result.solver.termination_condition),
        "objective": int(objective_value),
        "usedMeals": [],
        "validDays": [],
        "positionAssignments": {},
    }

    try:
        meal_positions = {}
        for m in model.MEALS:
            if model.meal_used[m]() > 0.5:
                output["usedMeals"].append(m)
                log(f"   Used meal: {m}")
                for p in model.POSITIONS:
                    if model.meal_position[m, p]() > 0.5:
                        meal_positions[m] = p
                        output["positionAssignments"][str(p)] = m
                        log(f"     Position {p}: {m}")
                        break
    except Exception as e:
        log(f"❌ ERROR processing meal positions: {e}")

    try:
        valid_combinations_count = 0
        for c in model.COMBINATIONS:
            if model.combination_valid[c]() > 0.5:
                valid_combinations_count += 1
                combo_meals = all_combinations[c]
                log(f"   Valid combination {c}: {combo_meals}")

                meals_detailed = {}
                total_calories = 0
                total_protein = 0

                ingredient_portions = {}
                for m in combo_meals:
                    ingredient_portions[m] = {}
                    
                    # Add fixed ingredients with their predetermined amounts
                    for i in fixed_ingredients[m]:
                        # Find the original grams amount from meals_input
                        original_grams = None
                        for meal in meals_input:
                            if meal["name"] == m:
                                for ing in meal["ingredients"]:
                                    if ing["name"] == i and ing["main"] == 0:
                                        original_grams = ing["grams"]
                                        break
                                break
                        
                        if original_grams is not None:
                            cal = original_grams * ingredient_macros[i]['calories_per_gram']
                            prot = original_grams * ingredient_macros[i]['protein_per_gram']
                            ingredient_portions[m][i] = {
                                "grams": round(original_grams, 1),
                                "calories": round(cal, 1),
                                "protein": round(prot, 1)
                            }
                    
                    # Add scalable ingredients with optimized amounts
                    for i in scalable_ingredients[m]:
                        grams = model.meal_portions[m, i]()
                        if grams > 0.1:
                            cal = grams * ingredient_macros[i]['calories_per_gram']
                            prot = grams * ingredient_macros[i]['protein_per_gram']
                            ingredient_portions[m][i] = {
                                "grams": round(grams, 1),
                                "calories": round(cal, 1),
                                "protein": round(prot, 1)
                            }

                for m in combo_meals:
                    meal_ingredients = []
                    meal_calories = 0
                    meal_protein = 0

                    # Add fixed ingredients
                    for i in fixed_ingredients[m]:
                        original_grams = None
                        for meal in meals_input:
                            if meal["name"] == m:
                                for ing in meal["ingredients"]:
                                    if ing["name"] == i and ing["main"] == 0:
                                        original_grams = ing["grams"]
                                        break
                                break
                        
                        if original_grams is not None:
                            cal = original_grams * ingredient_macros[i]['calories_per_gram']
                            prot = original_grams * ingredient_macros[i]['protein_per_gram']
                            meal_calories += cal
                            meal_protein += prot

                            meal_ingredients.append({
                                "name": i,
                                "grams": round(original_grams, 1),
                                "calories": round(cal, 1),
                                "protein": round(prot, 1)
                            })

                    # Add scalable ingredients
                    for i in scalable_ingredients[m]:
                        grams = model.meal_portions[m, i]()
                        if grams > 0.1:
                            cal = grams * ingredient_macros[i]['calories_per_gram']
                            prot = grams * ingredient_macros[i]['protein_per_gram']
                            meal_calories += cal
                            meal_protein += prot

                            meal_ingredients.append({
                                "name": i,
                                "grams": round(grams, 1),
                                "calories": round(cal, 1),
                                "protein": round(prot, 1)
                            })

                    meals_detailed[m] = {
                        "ingredients": meal_ingredients,
                        "totalCalories": round(meal_calories, 1),
                        "totalProtein": round(meal_protein, 1)
                    }

                    total_calories += meal_calories
                    total_protein += meal_protein

                output["validDays"].append({
                    "meals": list(combo_meals),
                    "positions": {m: meal_positions.get(m, None) for m in combo_meals},
                    "totals": {
                        "calories": round(total_calories, 1),
                        "protein": round(total_protein, 1)
                    },
                    "mealsDetailed": meals_detailed,
                    "ingredientPortions": ingredient_portions
                })
        
        log(f"   Total valid combinations found: {valid_combinations_count}")
        
    except Exception as e:
        log(f"❌ ERROR processing valid combinations: {e}")
        traceback.print_exc(file=sys.stderr)

    log("✅ Results processing complete")
    return output

# === ENTRY POINT ===

if __name__ == "__main__":
    try:
        raw_input = sys.stdin.read()
        log("🔹 Raw input received")

        data = json.loads(raw_input)
        log("🔹 JSON parsed successfully")

        meals = data["meals"]
        ingredient_macros = data["ingredientMacros"]
        meals_per_day = data["mealsPerDay"]
        target_calories = data["targetCalories"]
        target_protein = data["targetProtein"]

        log(f"➡️  Meals: {len(meals)}, MealsPerDay: {meals_per_day}, Target: {target_calories} cal / {target_protein}g prot")

        result = generate_optimized_days(meals, ingredient_macros, meals_per_day, target_calories, target_protein)

        log("✅ Optimization complete")
        print(json.dumps(result))
        sys.stdout.flush()

    except Exception as e:
        log("❌ Exception occurred:")
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"error": f"Solver exception: {str(e)}"}))
        sys.exit(1)