import { useCallback } from 'react';
import { useLocale } from 'next-intl';

/**
 * Catalog text (product, category, add-on, option) in the active admin
 * language. English stays in the base value and is the fallback.
 */
export const useLocalizedText = () => {
    const locale = useLocale();
    const code = locale.trim().toLowerCase().split('-')[0];

    return useCallback(
        (value: string | null | undefined, translations?: Record<string, string> | null) =>
            translations?.[code]?.trim() || value || '',
        [code],
    );
};
