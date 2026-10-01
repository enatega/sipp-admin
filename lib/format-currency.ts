import { resolveCurrencySymbol } from './formatCurrency';

/**
 * Format a currency value according to locale and currency code
 * @param value - The numeric value to format
 * @param currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
 * @param locale - The locale for formatting (e.g., 'en', 'de')
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currencyCode: string,
  locale: string = 'en',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    useGrouping?: boolean;
  },
  configuredSymbol?: string,
): string {
  // Handle null/undefined/invalid values
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Handle invalid numbers
  if (isNaN(numValue)) {
    return 'N/A';
  }

  try {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: options?.minimumFractionDigits ?? 2,
      maximumFractionDigits: options?.maximumFractionDigits ?? 2,
      useGrouping: options?.useGrouping ?? true,
    }).format(numValue);
    return `${resolveCurrencySymbol(configuredSymbol, currencyCode)} ${formatted}`;
  } catch (error) {
    // Fallback to basic formatting if Intl fails
    console.warn('Currency formatting failed, using fallback:', error);
    const formattedNum = numValue.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${resolveCurrencySymbol(configuredSymbol, currencyCode)} ${formattedNum}`;
  }
}

/**
 * Format currency value with locale from next-intl
 * This is a convenience function for use in React components
 */
export function useCurrencyFormatter() {
  return {
    formatCurrency: (
      value: number | string | null | undefined,
      currencyCode: string,
      locale: string,
      options?: Parameters<typeof formatCurrency>[3]
    ) => formatCurrency(value, currencyCode, locale, options),
  };
}
