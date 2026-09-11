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
 * This hook includes aggressive caching since currency data rarely changes
 * - staleTime:  5 min (data is considered fresh for  5 min)
 * - cacheTime: 24 hours (data stays in cache for 24 hours)
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
        staleTime: Infinity, // Never auto-refetch - data stays fresh forever
        gcTime: 1000 * 60 * 60 * 24, // 24 hours - data stays in cache for 24 hours (replaces cacheTime in v5)
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: false,
        ...options,
    });
};

export interface UpsertCurrencyPayload {
    code: string;
    name: string;
    symbol: string;
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
