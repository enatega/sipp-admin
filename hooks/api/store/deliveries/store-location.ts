import Axios from "@/config/axios";
import { ApiErrorResponse } from "@/types";
import { IGetStoreLocationResponse } from "@/types/api/store/deliveries/store-location";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";


/**
 * Hook to fetch store location
 * @param storeId - Store ID
 * @param options - React Query options
 * @returns Query result for store location
 */
export const useGetStoreLocation = (
    storeId: string,
    options?: UseQueryOptions<
        IGetStoreLocationResponse,
        ApiErrorResponse
    >
) => {
    return useQuery<IGetStoreLocationResponse, ApiErrorResponse>({
        queryKey: ['store-location', storeId],

        queryFn: async () => {
            const { data } = await Axios.get<IGetStoreLocationResponse>(
                `/apps/deliveries/store/profile/${storeId}/location`
            );

            return data;
        },

        enabled: !!storeId,

        ...options,
    });
};