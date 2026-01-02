export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF ',
  CNY: '¥',
  SGD: 'S$',
};

export function formatCurrency(amount: number, currency: string): string {
  const symbol = currencySymbols[currency] || currency;
  
  // Different formatting for different currencies
  if (currency === 'JPY' || currency === 'INR') {
    return `${symbol}${Math.round(amount).toLocaleString('en-US')}`;
  }
  
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

