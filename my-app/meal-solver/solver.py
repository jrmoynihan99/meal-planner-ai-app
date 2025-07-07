import sys
import json
from pyomo.environ import *
from itertools import combinations

def generate_optimized_days(meals_input, ingredient_macros, meals_per_day, target_calories, target_protein):
    calorie_slack = 100
    protein_slack = 10
    BIG_M = 10000

    avg_meal_calories = target_calories / meals_per_day
    meal_min_pct = 0.7
    meal_max_pct = 1.3
    meal_min_calories = avg_meal_calories * meal_min_pct
    meal_max_calories = avg_meal_calories * meal_max_pct

    meal_protein_min_pct = 0.15
    meal_protein_max_pct = 0.35
    calories_per_gram_protein = 4

    meals = [meal["name"] for meal in meals_input]
    ingredients = {
        meal["name"]: [ing["name"] for ing in meal["ingredients"]]
        for meal in meals_input
    }

    all_combinations = list(combinations(meals, meals_per_day))

    model = ConcreteModel()
    model.MEALS = Set(initialize=meals)
    model.COMBINATIONS = Set(initialize=range(len(all_combinations)))
    model.INGREDIENTS = Set(initialize=list(set(i for m in meals for i in ingredients[m])))
    model.POSITIONS = Set(initialize=range(meals_per_day))

    model.meal_portions = Var(model.MEALS, model.INGREDIENTS, domain=NonNegativeReals)
    model.meal_used = Var(model.MEALS, domain=Binary)
    model.meal_position = Var(model.MEALS, model.POSITIONS, domain=Binary)
    model.combination_valid = Var(model.COMBINATIONS, domain=Binary)

    def meal_portion_bounds(model, m, i):
        if i not in ingredients[m]:
            return model.meal_portions[m, i] == 0
        return model.meal_portions[m, i] <= 500 * model.meal_used[m]
    model.MealPortionBounds = Constraint(model.MEALS, model.INGREDIENTS, rule=meal_portion_bounds)

    def meal_ingredient_consistency(model, m, i):
        if i not in ingredients[m]:
            return Constraint.Skip
        return model.meal_portions[m, i] >= 5 * model.meal_used[m]
    model.MealIngredientConsistency = Constraint(model.MEALS, model.INGREDIENTS, rule=meal_ingredient_consistency)

    def meal_single_position(model, m):
        return sum(model.meal_position[m, p] for p in model.POSITIONS) <= 1
    model.MealSinglePosition = Constraint(model.MEALS, rule=meal_single_position)

    def meal_used_iff_positioned(model, m):
        return model.meal_used[m] == sum(model.meal_position[m, p] for p in model.POSITIONS)
    model.MealUsedIffPositioned = Constraint(model.MEALS, rule=meal_used_iff_positioned)

    def meal_calorie_lower(model, m):
        meal_calories = sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in ingredients[m])
        return meal_calories >= meal_min_calories * model.meal_used[m]
    model.MealCalorieLower = Constraint(model.MEALS, rule=meal_calorie_lower)

    def meal_calorie_upper(model, m):
        meal_calories = sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in ingredients[m])
        return meal_calories <= meal_max_calories * model.meal_used[m]
    model.MealCalorieUpper = Constraint(model.MEALS, rule=meal_calorie_upper)

    def meal_protein_balance_lower(model, m):
        meal_calories = sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in ingredients[m])
        meal_protein = sum(model.meal_portions[m, i] * ingredient_macros[i]['protein_per_gram'] for i in ingredients[m])
        return meal_protein * calories_per_gram_protein >= meal_calories * meal_protein_min_pct
    model.MealProteinBalanceLower = Constraint(model.MEALS, rule=meal_protein_balance_lower)

    def meal_protein_balance_upper(model, m):
        meal_calories = sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in ingredients[m])
        meal_protein = sum(model.meal_portions[m, i] * ingredient_macros[i]['protein_per_gram'] for i in ingredients[m])
        return meal_protein * calories_per_gram_protein <= meal_calories * meal_protein_max_pct
    model.MealProteinBalanceUpper = Constraint(model.MEALS, rule=meal_protein_balance_upper)

    model.CombinationPositionConsistency = ConstraintList()
    for c in model.COMBINATIONS:
        combo_meals = all_combinations[c]
        for pos in range(meals_per_day):
            meal_at_pos = combo_meals[pos]
            model.CombinationPositionConsistency.add(model.combination_valid[c] <= model.meal_position[meal_at_pos, pos])

    def combination_calorie_lower(model, c):
        combo_meals = all_combinations[c]
        total_calories = sum(
            sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in ingredients[m])
            for m in combo_meals
        )
        return total_calories >= (target_calories - calorie_slack) * model.combination_valid[c]
    model.CombinationCalorieLower = Constraint(model.COMBINATIONS, rule=combination_calorie_lower)

    def combination_calorie_upper(model, c):
        combo_meals = all_combinations[c]
        total_calories = sum(
            sum(model.meal_portions[m, i] * ingredient_macros[i]['calories_per_gram'] for i in ingredients[m])
            for m in combo_meals
        )
        return total_calories <= (target_calories + calorie_slack) * model.combination_valid[c] + BIG_M * (1 - model.combination_valid[c])
    model.CombinationCalorieUpper = Constraint(model.COMBINATIONS, rule=combination_calorie_upper)

    def combination_protein_lower(model, c):
        combo_meals = all_combinations[c]
        total_protein = sum(
            sum(model.meal_portions[m, i] * ingredient_macros[i]['protein_per_gram'] for i in ingredients[m])
            for m in combo_meals
        )
        return total_protein >= (target_protein - protein_slack) * model.combination_valid[c]
    model.CombinationProteinLower = Constraint(model.COMBINATIONS, rule=combination_protein_lower)

    def combination_protein_upper(model, c):
        combo_meals = all_combinations[c]
        total_protein = sum(
            sum(model.meal_portions[m, i] * ingredient_macros[i]['protein_per_gram'] for i in ingredients[m])
            for m in combo_meals
        )
        return total_protein <= (target_protein + protein_slack) * model.combination_valid[c] + BIG_M * (1 - model.combination_valid[c])
    model.CombinationProteinUpper = Constraint(model.COMBINATIONS, rule=combination_protein_upper)

    model.Objective = Objective(expr=sum(model.combination_valid[c] for c in model.COMBINATIONS), sense=maximize)

    solver = SolverFactory('cbc')
    result = solver.solve(model, tee=False)

    output = {
        "status": str(result.solver.termination_condition),
        "objective": int(model.Objective()),
        "usedMeals": [],
        "validDays": [],
        "positionAssignments": {},
    }

    meal_positions = {}
    for m in model.MEALS:
        if model.meal_used[m]() > 0.5:
            output["usedMeals"].append(m)
            for p in model.POSITIONS:
                if model.meal_position[m, p]() > 0.5:
                    meal_positions[m] = p
                    output["positionAssignments"][str(p)] = m
                    break

    for c in model.COMBINATIONS:
        if model.combination_valid[c]() > 0.5:
            combo_meals = all_combinations[c]

            meals_detailed = {}
            total_calories = 0
            total_protein = 0

            ingredient_portions = {}
            for m in combo_meals:
                ingredient_portions[m] = {}
                for i in ingredients[m]:
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

                for i in ingredients[m]:
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

    return output

# === ENTRY POINT ===

if __name__ == "__main__":
    raw_input = sys.stdin.read()
    data = json.loads(raw_input)

    meals = data["meals"]
    ingredient_macros = data["ingredientMacros"]
    meals_per_day = data["mealsPerDay"]
    target_calories = data["targetCalories"]
    target_protein = data["targetProtein"]

    result = generate_optimized_days(meals, ingredient_macros, meals_per_day, target_calories, target_protein)
    print(json.dumps(result))
