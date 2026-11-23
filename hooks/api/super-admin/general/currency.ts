import Axios from "@/config/axios";
import {
    ApiErrorResponse,
    Currency,
    GetActiveCurrencyResponse,
    GetCurrenciesResponse
} from "@/types";
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";



/**
 * Hook to fetch only the active currency
 * Returns the first active currency found or null
 * Refetch on focus so changes made in another admin session become visible.
 */
export const useGetActiveCurrency = (
    options?: Omit<UseQueryOptions<GetActiveCurrencyResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<GetActiveCurrencyResponse, ApiErrorResponse>({
        queryKey: ['active-currency'],
        queryFn: async () => {
            const { data } = await Axios.get<GetCurrenciesResponse | Currency>('/apps/deliveries/currency');

            // Supports both API shapes:
            // 1) Currency[]  (legacy/list endpoint)
            // 2) Currency    (current active currency endpoint)
            if (Array.isArray(data)) {
                return data.find((currency) => currency.isActive) || null;
            }

            return data ?? null;
        },
        staleTime: 30_000,
        gcTime: 1000 * 60 * 60 * 24, // 24 hours - data stays in cache for 24 hours (replaces cacheTime in v5)
        refetchOnWindowFocus: 'always',
        retry: false,
        ...options,
    });
};

export interface UpsertCurrencyPayload {
    code: string;
    name: string;
    symbol: string;
    usdConversionRate: number;
}

export const useSaveCurrency = (
    options?: UseMutationOptions<Currency, ApiErrorResponse, UpsertCurrencyPayload>
) => {
    const queryClient = useQueryClient();

    return useMutation<Currency, ApiErrorResponse, UpsertCurrencyPayload>({
        mutationFn: async (payload) => {
            const { data } = await Axios.post<Currency>('/apps/deliveries/currency', payload);
            return data;
        },
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ['active-currency'] });
            options?.onSuccess?.(...args);
        },
        ...options,
    });
};
