from pyomo.environ import *
from itertools import combinations

# === CONFIGURATION ===

# Meals and ingredients
meals = ['meal1', 'meal2', 'meal3', 'meal4', 'meal5', 'meal6', 'meal7']
ingredients = {
    'meal1': ['chicken', 'rice'],
    'meal2': ['beef', 'potato'],
    'meal3': ['tofu', 'noodles'],
    'meal4': ['fish', 'quinoa'],
    'meal5': ['eggs', 'bread'],
    'meal6': ['pork', 'beans'],
    'meal7': ['salmon', 'pasta']
}
ingredient_macros = {
    'chicken': {'calories': 1.65, 'protein': 0.31},
    'rice': {'calories': 1.3, 'protein': 0.025},
    'beef': {'calories': 2.5, 'protein': 0.26},
    'potato': {'calories': 0.77, 'protein': 0.02},
    'tofu': {'calories': 1.2, 'protein': 0.1},
    'noodles': {'calories': 1.4, 'protein': 0.05},
    'fish': {'calories': 2.0, 'protein': 0.25},
    'quinoa': {'calories': 1.2, 'protein': 0.045},
    'eggs': {'calories': 1.55, 'protein': 0.13},
    'bread': {'calories': 2.65, 'protein': 0.09},
    'pork': {'calories': 2.4, 'protein': 0.27},
    'beans': {'calories': 1.3, 'protein': 0.09},
    'salmon': {'calories': 2.1, 'protein': 0.28},
    'pasta': {'calories': 1.5, 'protein': 0.06}
}

# User configuration
meals_per_day = 3
target_calories = 2000
target_protein = 150
calorie_slack = 100
protein_slack = 10
BIG_M = 10000

# Generate all possible meal combinations
all_combinations = list(combinations(meals, meals_per_day))
print(f"🔢 Total possible meal combinations: {len(all_combinations)}")

# === MODEL SETUP ===

model = ConcreteModel()
model.MEALS = Set(initialize=meals)
model.COMBINATIONS = Set(initialize=range(len(all_combinations)))
model.INGREDIENTS = Set(initialize=list(set(i for m in meals for i in ingredients[m])))
model.POSITIONS = Set(initialize=range(meals_per_day))  # NEW: Position tracking

# === VARIABLES ===

# Fixed portion sizes for each meal (same across all uses)
model.meal_portions = Var(model.MEALS, model.INGREDIENTS, domain=NonNegativeReals)

# Whether each meal is used at all
model.meal_used = Var(model.MEALS, domain=Binary)

# NEW: Whether each meal is assigned to a specific position
model.meal_position = Var(model.MEALS, model.POSITIONS, domain=Binary)

# Whether each meal combination forms a valid day
model.combination_valid = Var(model.COMBINATIONS, domain=Binary)

# === CONSTRAINTS ===

# 1. Meal portion bounds - only non-zero if meal is used
def meal_portion_bounds(model, m, i):
    if i not in ingredients[m]:
        return model.meal_portions[m, i] == 0
    return model.meal_portions[m, i] <= 500 * model.meal_used[m]
model.MealPortionBounds = Constraint(model.MEALS, model.INGREDIENTS, rule=meal_portion_bounds)

# 2. If a meal is used, all its ingredients must be >= 5g
def meal_ingredient_consistency(model, m, i):
    if i not in ingredients[m]:
        return Constraint.Skip
    return model.meal_portions[m, i] >= 5 * model.meal_used[m]
model.MealIngredientConsistency = Constraint(model.MEALS, model.INGREDIENTS, rule=meal_ingredient_consistency)

# NEW: 3. Each meal can only be assigned to one position
def meal_single_position(model, m):
    return sum(model.meal_position[m, p] for p in model.POSITIONS) <= 1
model.MealSinglePosition = Constraint(model.MEALS, rule=meal_single_position)

# NEW: 4. Meal is used if and only if it's assigned to a position
def meal_used_iff_positioned(model, m):
    return model.meal_used[m] == sum(model.meal_position[m, p] for p in model.POSITIONS)
model.MealUsedIffPositioned = Constraint(model.MEALS, rule=meal_used_iff_positioned)

# NEW: 5. Position-based combination validity
def combination_position_consistency(model, c):
    combo_meals = all_combinations[c]
    # For this combination to be valid, each position must have exactly one meal assigned
    constraints = []
    for pos in range(meals_per_day):
        meal_at_pos = combo_meals[pos]
        # This meal must be assigned to this position for the combination to be valid
        constraints.append(model.combination_valid[c] <= model.meal_position[meal_at_pos, pos])
    return constraints
model.CombinationPositionConsistency = ConstraintList()
for c in model.COMBINATIONS:
    combo_meals = all_combinations[c]
    for pos in range(meals_per_day):
        meal_at_pos = combo_meals[pos]
        model.CombinationPositionConsistency.add(model.combination_valid[c] <= model.meal_position[meal_at_pos, pos])

# 6. Each valid combination must meet calorie targets
def combination_calorie_lower(model, c):
    combo_meals = all_combinations[c]
    total_calories = sum(
        sum(model.meal_portions[m, i] * ingredient_macros[i]['calories'] for i in ingredients[m])
        for m in combo_meals
    )
    return total_calories >= (target_calories - calorie_slack) * model.combination_valid[c]
model.CombinationCalorieLower = Constraint(model.COMBINATIONS, rule=combination_calorie_lower)

def combination_calorie_upper(model, c):
    combo_meals = all_combinations[c]
    total_calories = sum(
        sum(model.meal_portions[m, i] * ingredient_macros[i]['calories'] for i in ingredients[m])
        for m in combo_meals
    )
    return total_calories <= (target_calories + calorie_slack) * model.combination_valid[c] + BIG_M * (1 - model.combination_valid[c])
model.CombinationCalorieUpper = Constraint(model.COMBINATIONS, rule=combination_calorie_upper)

# 7. Each valid combination must meet protein targets
def combination_protein_lower(model, c):
    combo_meals = all_combinations[c]
    total_protein = sum(
        sum(model.meal_portions[m, i] * ingredient_macros[i]['protein'] for i in ingredients[m])
        for m in combo_meals
    )
    return total_protein >= (target_protein - protein_slack) * model.combination_valid[c]
model.CombinationProteinLower = Constraint(model.COMBINATIONS, rule=combination_protein_lower)

def combination_protein_upper(model, c):
    combo_meals = all_combinations[c]
    total_protein = sum(
        sum(model.meal_portions[m, i] * ingredient_macros[i]['protein'] for i in ingredients[m])
        for m in combo_meals
    )
    return total_protein <= (target_protein + protein_slack) * model.combination_valid[c] + BIG_M * (1 - model.combination_valid[c])
model.CombinationProteinUpper = Constraint(model.COMBINATIONS, rule=combination_protein_upper)

# === OBJECTIVE ===
# Maximize number of valid combinations (unique days)
model.Objective = Objective(expr=sum(model.combination_valid[c] for c in model.COMBINATIONS), sense=maximize)

# === SOLVE ===

print("🔄 Solving optimization problem...")
print(f"📊 Optimizing meal portions to maximize unique day combinations")
print(f"🍽️  Available meals: {len(meals)}")
print(f"🎯 Target: {target_calories} ± {calorie_slack} calories, {target_protein} ± {protein_slack}g protein")

solver = SolverFactory('cbc')
result = solver.solve(model, tee=False)

# === OUTPUT ===

print(f"\n✅ Solution Status: {result.solver.termination_condition}")
print(f"📊 Objective Value: {model.Objective():.0f}")

# Show optimized meal portions and their assigned positions
print("\n📦 Optimized Meal Portions and Position Assignments:")
used_meals = []
meal_positions = {}
for m in model.MEALS:
    if model.meal_used[m]() > 0.5:
        used_meals.append(m)
        # Find which position this meal is assigned to
        assigned_position = None
        for p in model.POSITIONS:
            if model.meal_position[m, p]() > 0.5:
                assigned_position = p
                break
        meal_positions[m] = assigned_position
        
        print(f"\n🍽️  {m} (Position {assigned_position + 1}):")
        meal_calories = 0
        meal_protein = 0
        for i in ingredients[m]:
            portion = model.meal_portions[m, i]()
            if portion > 0.1:
                print(f"    {i}: {portion:.1f}g")
                meal_calories += portion * ingredient_macros[i]['calories']
                meal_protein += portion * ingredient_macros[i]['protein']
        print(f"    Totals: {meal_calories:.1f} cal, {meal_protein:.1f}g protein")

# Show valid combinations (unique days)
print(f"\n📅 Valid Unique Days ({sum(model.combination_valid[c]() for c in model.COMBINATIONS):.0f} combinations):")
day_num = 1
for c in model.COMBINATIONS:
    if model.combination_valid[c]() > 0.5:
        combo_meals = all_combinations[c]
        print(f"\nDay {day_num}: {list(combo_meals)}")
        
        # Show position-based breakdown
        positioned_meals = [""] * meals_per_day
        for m in combo_meals:
            if m in meal_positions:
                positioned_meals[meal_positions[m]] = m
        print(f"  Positions: {positioned_meals}")
        
        # Calculate total nutrition for this combination
        total_calories = 0
        total_protein = 0
        for m in combo_meals:
            meal_calories = sum(
                model.meal_portions[m, i]() * ingredient_macros[i]['calories']
                for i in ingredients[m]
            )
            meal_protein = sum(
                model.meal_portions[m, i]() * ingredient_macros[i]['protein']
                for i in ingredients[m]
            )
            total_calories += meal_calories
            total_protein += meal_protein
            print(f"  {m}: {meal_calories:.1f} cal, {meal_protein:.1f}g protein")
        
        print(f"  Day totals: {total_calories:.1f} calories, {total_protein:.1f}g protein")
        day_num += 1

print(f"\n🎯 Target: {target_calories} ± {calorie_slack} calories, {target_protein} ± {protein_slack}g protein")
print(f"📈 Successfully generated {sum(model.combination_valid[c]() for c in model.COMBINATIONS):.0f} unique days!")
print(f"🍽️  Used {len(used_meals)} out of {len(meals)} available meals")

# Show position assignments
print(f"\n📍 Position Assignments:")
for p in model.POSITIONS:
    assigned_meal = None
    for m in model.MEALS:
        if model.meal_position[m, p]() > 0.5:
            assigned_meal = m
            break
    if assigned_meal:
        print(f"  Position {p + 1}: {assigned_meal}")
    else:
        print(f"  Position {p + 1}: (empty)")

# Show which combinations were NOT feasible
infeasible_count = 0
for c in model.COMBINATIONS:
    if model.combination_valid[c]() < 0.5:
        infeasible_count += 1

print(f"❌ {infeasible_count} combinations were not feasible with the nutritional constraints")