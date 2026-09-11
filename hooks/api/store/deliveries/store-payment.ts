import Axios from "@/config/axios";
import { ApiErrorResponse } from "@/types";
import { StorePaymentInfoResponse } from "@/types/api/store/deliveries/store-payment";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

/**
 * Hook to fetch store payment information
 * @param storeId - Store ID
 * @param options - React Query options
 * @returns Query result for store payment info
 */
export const useGetStorePaymentInfo = (
    storeId: string,
    options?: UseQueryOptions<
        StorePaymentInfoResponse,
        ApiErrorResponse
    >
) => {
    return useQuery<StorePaymentInfoResponse, ApiErrorResponse>({
        queryKey: ['store-payment-info', storeId],

        queryFn: async () => {
            const { data } = await Axios.get<StorePaymentInfoResponse>(
                `/apps/deliveries/store/profile/${storeId}/payment-info`
            );

            return data;
        },

        enabled: !!storeId,

        ...options,
    });
};