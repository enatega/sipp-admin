import Axios from '@/config/axios';
import { ApiErrorResponse } from '@/types/api/common';
import { DeliveryFeeSettingsResponse, UpdateDistanceDeliveryFeePayload, UpdateFixedDeliveryFeePayload, UpdateOrderValueBaseDeliveryFeePayload } from '@/types/api/super-admin/enatega-deliveries/delivery-fee.api';
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

type GetDeliveryFeesOptions = Omit<
    UseQueryOptions<DeliveryFeeSettingsResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
>;

export const useGetDeliveryFees = (
    options?: GetDeliveryFeesOptions
) => {
    return useQuery<DeliveryFeeSettingsResponse, ApiErrorResponse>({
        queryKey: ['delivery-fees'], // important for invalidation later
        queryFn: async () => {
            const { data } = await Axios.get<DeliveryFeeSettingsResponse>(
                '/delivery-fee-settings'
            );
            return data;
        },
        ...options,
    });
};



/**
 * Hook to update the fixed delivery fee
 * @param options - React Query mutation options
 * @returns Mutation result for updating fixed delivery fee
 */
export const useUpdateFixedDeliveryFee = (
    options?: UseMutationOptions<
        DeliveryFeeSettingsResponse,
        ApiErrorResponse,
        UpdateFixedDeliveryFeePayload
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<DeliveryFeeSettingsResponse, ApiErrorResponse, UpdateFixedDeliveryFeePayload>({
        mutationFn: async (payload) => {
            const { data } = await Axios.patch<DeliveryFeeSettingsResponse>(
                '/delivery-fee-settings/fixed',
                payload
            );
            return data;
        },
        onSuccess: () => {
            // Invalidate delivery fee query so UI is updated
            queryClient.invalidateQueries({ queryKey: ['delivery-fees'] });
        },
        ...options,
    });
};

/**
 * Hook to update the fixed delivery fee
 * @param options - React Query mutation options
 * @returns Mutation result for updating fixed delivery fee
 */
export const useUpdateDistanceBasedDeliveryFee = (
    options?: UseMutationOptions<
        DeliveryFeeSettingsResponse,
        ApiErrorResponse,
        UpdateDistanceDeliveryFeePayload
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<DeliveryFeeSettingsResponse, ApiErrorResponse, UpdateDistanceDeliveryFeePayload>({
        mutationFn: async (payload) => {
            const { data } = await Axios.patch<DeliveryFeeSettingsResponse>(
                '/delivery-fee-settings/distance',
                payload
            );
            return data;
        },
        onSuccess: () => {
            // Invalidate delivery fee query so UI is updated
            queryClient.invalidateQueries({ queryKey: ['delivery-fees'] });
        },
        ...options,
    });
};


/**
 * Hook to update the fixed delivery fee
 * @param options - React Query mutation options
 * @returns Mutation result for updating fixed delivery fee
 */
export const useUpdateOrderValueBasedDeliveryFee = (
    options?: UseMutationOptions<
        DeliveryFeeSettingsResponse,
        ApiErrorResponse,
        UpdateOrderValueBaseDeliveryFeePayload
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<DeliveryFeeSettingsResponse, ApiErrorResponse, UpdateOrderValueBaseDeliveryFeePayload>({
        mutationFn: async (payload) => {
            const { data } = await Axios.patch<DeliveryFeeSettingsResponse>(
                '/delivery-fee-settings/order-value',
                payload
            );
            return data;
        },
        onSuccess: () => {
            // Invalidate delivery fee query so UI is updated
            queryClient.invalidateQueries({ queryKey: ['delivery-fees'] });
        },
        ...options,
    });
};