export function convertGramsToAmount(
  grams: number,
  gramsPerUnit: number,
  unit: string
): string {
  if (!gramsPerUnit || gramsPerUnit <= 0) return `${Math.round(grams)} g`;
  const value = grams / gramsPerUnit;
  const rounded = parseFloat(value.toFixed(1));
  return `${rounded} ${unit}`;
}
