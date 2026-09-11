import Axios from '@/config/axios';
import { ApiErrorResponse } from '@/types/api/common';
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';
import { CreateCouponPayload, CreateCouponResponse, DeleteCouponPayload, DeleteCouponResponse, GetAllCouponsResponse, GetCouponByIdResponse, UpdateCouponPayload, UpdateCouponResponse } from '@/types/api/super-admin/enatega-deliveries/discount-offers';
import { useMutation, UseMutationOptions, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useApiQuery } from '../../use-api-query';

type GetAllCouponsOptions = Omit<
    UseQueryOptions<GetAllCouponsResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
>;

export function useGetAllCoupons(options?: GetAllCouponsOptions) {
    const modeScope = useDeliveriesAdminModeScope();

    return useApiQuery<GetAllCouponsResponse>(
        '/apps/deliveries/coupons/get-all',

        {
            placeholderData: (previous) => previous,
            ...options,
        },
        {
            mapper: (params) => {
                const {
                    page,
                    limit,
                    search,
                    couponType,
                    endDate,
                    startDate,
                    tab,
                } = params;

                return {
                    page,
                    limit,
                    search,
                    discount_type: couponType,
                    end_date: endDate ? new Date(endDate as string).toISOString() : undefined,
                    start_date: startDate ? new Date(startDate as string).toISOString() : undefined,
                    status: tab,
                    modeScope,
                };
            },

        },

    );
}


/**
 * Hook to get a single coupon by ID
 * @param id - Coupon ID
 * @param options - React Query options
 * @returns Query result
 */

type GetCouponByIdOptions = Omit<
    UseQueryOptions<GetCouponByIdResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
>;

export function useGetCouponById(id: string, options?: GetCouponByIdOptions) {
    const modeScope = useDeliveriesAdminModeScope();
    return useApiQuery<GetCouponByIdResponse>(
        `/apps/deliveries/coupons/${id}`,
        options,
        {
            mapper: (params) => ({
                ...params,
                modeScope,
            }),
        }
    );
}


/**
 * Hook to delete a coupon
 * @param options - React Query mutation options
 * @returns Mutation result for deleting coupon
 */
export const useDeleteCoupon = (
    options?: UseMutationOptions<
        DeleteCouponResponse,
        ApiErrorResponse,
        DeleteCouponPayload
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        DeleteCouponResponse,
        ApiErrorResponse,
        DeleteCouponPayload
    >({
        mutationFn: async (payload) => {
            const { data } = await Axios.delete<DeleteCouponResponse>(
                `/apps/deliveries/coupons/${payload.id}`
            );
            return data;
        },

        onSuccess: (data, variables, context, meta) => {
            // Invalidate coupons list
            queryClient.invalidateQueries({
                queryKey: ['/apps/deliveries/coupons/get-all'],
            });

            options?.onSuccess?.(data, variables, context, meta);
        },

        ...options,
    });
};


/**
 * Hook to update a coupon
 * @param options - React Query mutation options
 * @returns Mutation result for updating coupon
 */
export const useUpdateCoupon = (
    options?: UseMutationOptions<
        UpdateCouponResponse,
        ApiErrorResponse,
        UpdateCouponPayload
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        UpdateCouponResponse,
        ApiErrorResponse,
        UpdateCouponPayload
    >({
        mutationFn: async (payload) => {
            const { id, ...body } = payload;

            const { data } = await Axios.patch<UpdateCouponResponse>(
                `/apps/deliveries/coupons/${id}`,
                body
            );

            return data;
        },

        onSuccess: (data, variables, context, meta) => {
            // Invalidate coupons list
            queryClient.invalidateQueries({
                queryKey: ['/apps/deliveries/coupons/get-all'],
            });


            options?.onSuccess?.(data, variables, context, meta);
        },

        ...options,
    });
};


/**
 * Hook to add a coupon
 * @param options - React Query mutation options
 * @returns Mutation result for adding coupon
 */
export const useAddCoupon = (
    options?: UseMutationOptions<
        CreateCouponResponse,
        ApiErrorResponse,
        CreateCouponPayload
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        CreateCouponResponse,
        ApiErrorResponse,
        CreateCouponPayload
    >({
        mutationFn: async (payload) => {
            const { data } = await Axios.post<CreateCouponResponse>(
                '/apps/deliveries/coupons/add-coupon',
                payload
            );
            return data;
        },

        onSuccess: (data, variables, context, meta) => {
            // invalidate coupons list
            queryClient.invalidateQueries({
                queryKey: ['/apps/deliveries/coupons/get-all'],
            });

            options?.onSuccess?.(data, variables, context, meta);
        },

        ...options,
    });
};
