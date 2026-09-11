import Axios from "@/config/axios";
import { ApiErrorResponse } from "@/types/api/common";
import { StoreProfileResponse, UpdateStoreApprovalStatusPayload, UpdateStoreApprovalStatusResponse, UpdateStoreBlockStatusResponse, UpdateStoreDataPayload, UpdateStoreDataResponse, UpdateStoreSettingPayload, UpdateStoreSettingResponse } from "@/types/api/store/deliveries/profile";
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

/**
 * Hook to fetch store profile details
 * @param storeId - Store ID
 * @param options - React Query options
 * @returns Query result for store profile
 */
export const useGetStoreProfile = (
    storeId: string,
    options?: UseQueryOptions<StoreProfileResponse, ApiErrorResponse>
) => {
    return useQuery<StoreProfileResponse, ApiErrorResponse>({
        queryKey: ['store-profile', storeId],

        queryFn: async () => {
            const { data } = await Axios.get<StoreProfileResponse>(
                `/apps/deliveries/store/profile/${storeId}`
            );

            return data;
        },

        enabled: !!storeId, // prevent call if storeId missing

        ...options,
    });
};


/**
 * Hook to update store settings
 * @param options - React Query mutation options
 * @returns Mutation result for updating store settings
 */
export const useUpdateStoreSetting = (
    options?: UseMutationOptions<
        UpdateStoreSettingResponse,
        ApiErrorResponse,
        UpdateStoreSettingPayload
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        UpdateStoreSettingResponse,
        ApiErrorResponse,
        UpdateStoreSettingPayload
    >({
        ...options,
        mutationFn: async (payload) => {
            const { storeId, field, value } = payload;

            const { data } = await Axios.patch<UpdateStoreSettingResponse>(
                `/apps/deliveries/store/profile/${storeId}/settings`,
                {
                    field,
                    value,
                }
            );

            return data;
        },

        onSuccess: (...args) => {
            const variables = args[1];
            void queryClient.invalidateQueries({
                queryKey: ['store-profile', variables.storeId],
            });
            options?.onSuccess?.(...args);
        },

        onError: (...args) => {
            options?.onError?.(...args);
        },

        onSettled: (...args) => {
            options?.onSettled?.(...args);
        },
    });
};


export const useUpdateStoreData = (
    options?: UseMutationOptions<
        UpdateStoreDataResponse,
        ApiErrorResponse,
        UpdateStoreDataPayload | FormData
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        UpdateStoreDataResponse,
        ApiErrorResponse,
        UpdateStoreDataPayload | FormData
    >({
        ...options,
        mutationFn: async (payload) => {
            let storeId: string;
            let body: FormData | Partial<UpdateStoreDataPayload>;

            if (payload instanceof FormData) {
                storeId = payload.get('storeId') as string;
                body = payload;
            } else {
                storeId = payload.storeId;
                body = { ...payload };
            }

            const { data } = await Axios.patch<UpdateStoreDataResponse>(
                `/apps/deliveries/store/profile/${storeId}/update`,
                body,
                {
                    headers:
                        payload instanceof FormData
                            ? { 'Content-Type': 'multipart/form-data' }
                            : undefined,
                }
            );

            return data;
        },

        onSuccess: (...args) => {
            const variables = args[1];
            const storeId =
                variables instanceof FormData
                    ? (variables.get('storeId') as string)
                    : variables.storeId;

            void queryClient.invalidateQueries({
                queryKey: ['store-profile', storeId],
            });
            void queryClient.invalidateQueries({
                queryKey: ['store-timing', storeId],
            });

            options?.onSuccess?.(...args);
        },

        onError: (...args) => {
            options?.onError?.(...args);
        },

        onSettled: (...args) => {
            options?.onSettled?.(...args);
        },
    });
};

/**
 * Hook to toggle store block status
 * @param options - React Query mutation options
 * @returns Mutation result for updating store block status
 */
export const useUpdateStoreBlockStatus = (
    options?: UseMutationOptions<
        UpdateStoreBlockStatusResponse,
        ApiErrorResponse,
        { storeId: string }
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        UpdateStoreBlockStatusResponse,
        ApiErrorResponse,
        { storeId: string }
    >({
        ...options,
        mutationFn: async ({ storeId }) => {
            const { data } = await Axios.patch<UpdateStoreBlockStatusResponse>(
                `/apps/deliveries/store/profile/${storeId}/block-status`
            );

            return data;
        },

        onSuccess: (...args) => {
            const variables = args[1];
            void queryClient.invalidateQueries({
                queryKey: ['store-profile', variables.storeId],
            });
            options?.onSuccess?.(...args);
        },

        onError: (...args) => {
            options?.onError?.(...args);
        },

        onSettled: (...args) => {
            options?.onSettled?.(...args);
        },
    });
};


/**
 * Hook to update store approval status
 * @param options - React Query mutation options
 * @returns Mutation result for updating store approval status
 */
export const useUpdateStoreApprovalStatus = (
    options?: UseMutationOptions<
        UpdateStoreApprovalStatusResponse,
        ApiErrorResponse,
        UpdateStoreApprovalStatusPayload
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        UpdateStoreApprovalStatusResponse,
        ApiErrorResponse,
        UpdateStoreApprovalStatusPayload
    >({
        ...options,
        mutationFn: async ({ storeId, status }) => {
            const { data } = await Axios.patch<UpdateStoreApprovalStatusResponse>(
                `/apps/deliveries/store/profile/${storeId}/status`,
                { status }
            );

            return data;
        },

        onSuccess: (...args) => {
            const variables = args[1];
            void queryClient.invalidateQueries({
                queryKey: ['store-profile', variables.storeId],
            });
            options?.onSuccess?.(...args);
        },

        onError: (...args) => {
            options?.onError?.(...args);
        },

        onSettled: (...args) => {
            options?.onSettled?.(...args);
        },
    });
};