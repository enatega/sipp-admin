import { useGetActiveCurrency } from '@/hooks/api/super-admin/general/currency';
import { useLocale } from 'next-intl';
import { formatCurrency } from '@/lib/format-currency';
import { DEFAULT_CURRENCY } from '@/constants/currency.constants';
import { resolveCurrencySymbol } from '@/lib/formatCurrency';

export const useCurrency = () => {
    const locale = useLocale();
    const { data: currency, isLoading, error, isError } = useGetActiveCurrency();

    const currencyCode = currency?.code || DEFAULT_CURRENCY.code;
    const currencySymbol = resolveCurrencySymbol(currency?.symbol, currencyCode);
    const currencyName = currency?.name || DEFAULT_CURRENCY.name;

    return {
        currency: currency || null,
        currencyIsLoading: isLoading,
        currencyError: error,
        currencyIsError: isError,
        currencySymbol,
        currencyCode,
        currencyName,
        locale,
        // Enhanced currency formatting function
        formatCurrency: (
            value: number | string | null | undefined,
            options?: {
                minimumFractionDigits?: number;
                maximumFractionDigits?: number;
                useGrouping?: boolean;
            }
        ) => formatCurrency(value, currencyCode, locale, options, currencySymbol),
        // Legacy compatibility
        format: (value: number | string | null | undefined) =>
            formatCurrency(value, currencyCode, locale, undefined, currencySymbol),
    };
};
