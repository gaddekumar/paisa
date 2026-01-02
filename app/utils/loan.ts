// Calculate remaining loan balance using amortization formula
export function calculateRemainingLoanBalance(
  principal: number,
  annualRate: number,
  loanTermYears: number,
  yearsElapsed: number
): number {
  if (yearsElapsed >= loanTermYears) return 0;
  if (annualRate === 0) {
    return principal * (1 - yearsElapsed / loanTermYears);
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = loanTermYears * 12;
  const monthsElapsed = yearsElapsed * 12;

  // Monthly payment calculation
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  // Remaining balance after monthsElapsed payments
  const remainingBalance = principal * Math.pow(1 + monthlyRate, monthsElapsed) - 
    monthlyPayment * (Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate;

  return Math.max(0, remainingBalance);
}

// Calculate equity in house
export function calculateEquity(
  currentValue: number,
  downpayment: number,
  houseCost: number,
  annualRate: number,
  loanTermYears: number,
  purchaseDate: string
): number {
  const loanAmount = houseCost - downpayment;
  const purchaseDateObj = new Date(purchaseDate);
  const today = new Date();
  const yearsElapsed = (today.getTime() - purchaseDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  const remainingLoan = calculateRemainingLoanBalance(loanAmount, annualRate, loanTermYears, yearsElapsed);
  return currentValue - remainingLoan;
}

