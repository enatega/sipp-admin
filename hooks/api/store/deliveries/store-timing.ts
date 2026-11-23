import Axios from "@/config/axios";
import { ApiErrorResponse } from "@/types/api/common";
import { IGetStoreTimingResponse } from "@/types/api/store/deliveries/store-timing-d";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

/**
 * Hook to fetch store timings
 * @param storeId - Store ID
 * @param options - React Query options
 * @returns Query result for store timings
 */
export const useGetStoreTiming = (
    storeId: string,
    options?: UseQueryOptions<
        IGetStoreTimingResponse,
        ApiErrorResponse
    >
) => {
    return useQuery<IGetStoreTimingResponse, ApiErrorResponse>({
        queryKey: ['store-timing', storeId],

        queryFn: async () => {
            const { data } = await Axios.get<IGetStoreTimingResponse>(
                `/apps/deliveries/store/profile/${storeId}/timing`
            );

            return data;
        },

        enabled: !!storeId,

        ...options,
    });
};