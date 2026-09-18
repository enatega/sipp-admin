export const resolveCurrencySymbol = (symbol?: string) => symbol || '₡';

// Helper function to format currency
export const formatCurrency = (
  amount?: number | string | null,
  currencySymbol?: string,
) => {
  const resolvedCurrencySymbol = resolveCurrencySymbol(currencySymbol);
  const normalizedAmount = Number(amount);
  const safeAmount = Number.isFinite(normalizedAmount) ? normalizedAmount : 0;

  return `${resolvedCurrencySymbol} ${safeAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
