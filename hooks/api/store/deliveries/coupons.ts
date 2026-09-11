import Axios from "@/config/axios";
import { useQueryParams } from "@/hooks/use-query-params";
import { AddStoreCouponResponse, ApiErrorResponse, DeleteStoreCouponResponse, GetCouponsResponse, GetStoreCouponByIdResponse, GetStoreProductsResponse, PostCouponPayload, StoreCouponDeliveryType, UpdateCouponPayload, UpdateCouponResponse } from "@/types";
import type { CouponProductSummary } from "@/types/entities/store/deliveries/coupons";
import { MutationOptions, useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
export type Product = CouponProductSummary;


export const useGetAllStoreCoupons = (
    store_id?: string,
    options?: Omit<UseQueryOptions<GetCouponsResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) => {
    const { getParam } = useQueryParams();
    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const deliveryType = getParam('deliveryType') as StoreCouponDeliveryType;
    const paymentMethod = getParam('paymentMethod') || undefined;
    const couponType = getParam('couponType') || undefined;
    const startDate = getParam('startDate') || undefined;
    const endDate = getParam('endDate') || undefined;
    const tab = getParam('tab') || undefined;

    const params = {
        page,
        limit,
        search,
        delivery_type: deliveryType,
        payment_method: paymentMethod,
        discount_type: couponType,
        start_date: startDate ? new Date(startDate).toISOString() : undefined,
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
        status: tab,
    };

    return useQuery<GetCouponsResponse, ApiErrorResponse>({

        queryKey: ["get-all-store-coupons", params],
        queryFn: async () => {
            const query = new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    query.append(key, String(value));
                }
            });

            const res = await Axios.get<GetCouponsResponse>(`/apps/deliveries/store/coupons/get-all/${store_id}?${query.toString()}`);
            return res.data;
        },
        enabled: !!store_id,
        ...options,

    })

}

export const useDeleteStoreCoupon = (options?: UseMutationOptions<DeleteStoreCouponResponse, ApiErrorResponse, string>) => {

    const queryClient = useQueryClient();

    return useMutation<DeleteStoreCouponResponse, ApiErrorResponse, string>({

        mutationFn: async (id: string) => {

            const response = await Axios.delete<DeleteStoreCouponResponse>(`/apps/deliveries/store/coupons/${id}`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(
                {
                    queryKey: ["get-all-store-coupons"],
                    exact: false,
                    refetchType: "active"
                })

        },
        ...options

    })
}

export const useAddStoreCoupon = (options?: MutationOptions<AddStoreCouponResponse, ApiErrorResponse, { store_id: string, payload: PostCouponPayload }>) => {

    const queryClient = useQueryClient();

    return useMutation<AddStoreCouponResponse, ApiErrorResponse, { store_id: string, payload: PostCouponPayload }>({

        mutationFn: async ({ store_id, payload }: { store_id: string, payload: PostCouponPayload }) => {
            const response = await Axios.post<AddStoreCouponResponse>(
                `/apps/deliveries/store/coupons/add-coupon/${store_id}`,
                payload
            )

            return response.data

        },
        onSuccess: () => {
            queryClient.invalidateQueries(
                {
                    queryKey: ["get-all-store-coupons"],
                    exact: false,
                    refetchType: "active"
                })
        },
        ...options
    })

}

export const useUpdateStoreCoupon = (options?: MutationOptions<UpdateCouponResponse, ApiErrorResponse, { id: string, payload: UpdateCouponPayload }>) => {

    const queryClient = useQueryClient();

    return useMutation<UpdateCouponResponse, ApiErrorResponse, { id: string, payload: UpdateCouponPayload }>({

        mutationFn: async ({ id, payload }: { id: string, payload: UpdateCouponPayload }) => {
            const response = await Axios.patch<UpdateCouponResponse>(
                `/apps/deliveries/store/coupons/${id}`,
                payload
            )

            return response.data

        },
        onSuccess: () => {
            queryClient.invalidateQueries(
                {
                    queryKey: ["get-all-store-coupons"],
                    exact: false,
                    refetchType: "active"
                })

        },
        ...options
    })

}

export const useGetStoreCouponById = (
    coupon_id: string,
    options?: Omit<UseQueryOptions<GetStoreCouponByIdResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<GetStoreCouponByIdResponse, ApiErrorResponse>({
        queryKey: ["get-store-coupon-by-id", coupon_id],
        queryFn: async () => {
            const res = await Axios.get<GetStoreCouponByIdResponse>(`/apps/deliveries/store/coupons/${coupon_id}`);
            return res.data;
        },
        enabled: !!coupon_id,
        ...options,
    })
}

export const useGetStoreProducts = (store_id: string, options?: Omit<UseQueryOptions<GetStoreProductsResponse, ApiErrorResponse>, "queryKey" | "queryFn">) => {
    return useQuery<GetStoreProductsResponse, ApiErrorResponse>({
        queryKey: ["get-store-products", store_id],
        queryFn: async () => {
            const res = await Axios.get<GetStoreProductsResponse>(`/apps/deliveries/store/coupons/${store_id}/products`)
            return res.data
        },
        ...options
    })
}
