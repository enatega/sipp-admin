export const resolveCurrencySymbol = (symbol?: string, code?: string) => {
  const normalized = symbol?.trim();
  if (normalized === '¡') return '₡';
  if (normalized && normalized.toUpperCase() !== code?.toUpperCase() && !/^[A-Z]{3}$/i.test(normalized)) return normalized;
  const currencyCode = code || normalized;
  if (currencyCode?.toUpperCase() === 'CRC') return '₡';
  if (currencyCode) {
    try {
      const resolved = new Intl.NumberFormat('en', {
        style: 'currency', currency: currencyCode, currencyDisplay: 'narrowSymbol',
      }).formatToParts(0).find((part) => part.type === 'currency')?.value;
      if (resolved && resolved.toUpperCase() !== currencyCode.toUpperCase()) return resolved;
    } catch {
      // Invalid codes have no reliable symbol.
    }
  }
  return '¤';
};

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
