import { useGetActiveCurrency } from '@/hooks/api/super-admin/general/currency';
import { useLocale } from 'next-intl';
import { formatCurrency } from '@/lib/format-currency';

export const useCurrency = () => {
    const locale = useLocale();
    const { data: currency, isLoading, error, isError } = useGetActiveCurrency({
        refetchOnMount: false
    });

    const currencyCode = currency?.code || 'USD';
    const currencySymbol = currency?.symbol || '';
    const currencyName = currency?.name || '';

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
        ) => formatCurrency(value, currencyCode, locale, options),
        // Legacy compatibility
        format: (value: number | string | null | undefined) =>
            formatCurrency(value, currencyCode, locale),
    };
};
