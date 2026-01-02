// Calculate depreciated value of an asset
export function calculateDepreciatedValue(
  originalValue: number,
  depreciationRate: number, // percentage per year
  yearsElapsed: number
): number {
  // Using straight-line depreciation: value decreases by depreciationRate% each year
  // Formula: value = originalValue * (1 - depreciationRate/100)^yearsElapsed
  const depreciatedValue = originalValue * Math.pow(1 - depreciationRate / 100, yearsElapsed);
  return Math.max(0, depreciatedValue);
}

