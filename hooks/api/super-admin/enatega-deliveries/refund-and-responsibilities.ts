import Axios from '@/config/axios';
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';
import { useQueryParams } from '@/hooks/use-query-params';
import { ApiErrorResponse } from '@/types';
import { ApproveRefundRequestPayload, CreateRefundRequest, CreateRefundRequestResponse, GetRefundAndResponsibilitiesQueryParams, RefundOrderOption, RefundRequestActivityLog, RefundRequestDetailResponse, RefundRequestsResponse, RejectRefundRequestPayload } from '@/types/api/super-admin/enatega-deliveries/refunds-and-responsibilities';
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions
} from '@tanstack/react-query';


export function useGetRefundAndResponsibilitiesList(
    options?: Omit<
        UseQueryOptions<RefundRequestsResponse, ApiErrorResponse>,
        'queryKey' | 'queryFn'
    >,
) {
    const { getParam } = useQueryParams();
    const modeScope = useDeliveriesAdminModeScope();

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const startDate = getParam('startDate') || undefined;
    const endDate = getParam('endDate') || undefined;

    const params: GetRefundAndResponsibilitiesQueryParams = {
        page,
        limit,
        search,
        start_date: startDate,
        end_date: endDate,
        modeScope,
    };

    return useQuery<RefundRequestsResponse, ApiErrorResponse>({
        queryKey: ['get-refunds-and-responsibilities', params],
        queryFn: async () => {
            const { data } = await Axios.get<RefundRequestsResponse>(
                '/apps/deliveries/admin/refund-responsibilities/requests',
                {
                    params,
                },
            );
            return data;
        },
        ...options,
    });
}

export const useCreateRefundRequest = (
    options?: UseMutationOptions<CreateRefundRequestResponse, ApiErrorResponse, CreateRefundRequest>,
) => {
    const queryClient = useQueryClient();
    return useMutation<CreateRefundRequestResponse, ApiErrorResponse, CreateRefundRequest>({
        mutationFn: async (payload) => {
            const { data } = await Axios.post<CreateRefundRequestResponse>(
                '/apps/deliveries/admin/refund-responsibilities/requests',
                payload,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['get-refunds-and-responsibilities'],
                exact: false,
            });
        },
        ...options,
    });
};

export const useGetDeliveredRefundOrders = (
    storeId?: string,
    enabled = true,
) => {
    const modeScope = useDeliveriesAdminModeScope();
    return useQuery<RefundOrderOption[], ApiErrorResponse>({
        queryKey: ['refund-delivered-orders', storeId ?? null, modeScope ?? null],
        enabled: enabled && !!storeId,
        queryFn: async () => {
            const { data } = await Axios.get<{ data?: RefundOrderOption[] }>(
                '/apps/deliveries/super-admin/orders',
                {
                    params: {
                        page: 1,
                        limit: 100,
                        status: 'delivered',
                        store: storeId,
                        modeScope,
                    },
                },
            );
            return data?.data ?? [];
        },
    });
};

export function useGetRefundRequestActivityLogById(
    requestId: string,
    options?: Omit<
        UseQueryOptions<
            RefundRequestActivityLog[],
            ApiErrorResponse
        >,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<
        RefundRequestActivityLog[],
        ApiErrorResponse
    >({
        // IMPORTANT: requestId must be part of queryKey
        queryKey: ['get-refunds-request-activity-log', requestId],

        queryFn: async () => {
            const { data } =
                await Axios.get<RefundRequestActivityLog[]>(
                    `/apps/deliveries/admin/refund-responsibilities/requests/${requestId}/activity`
                );

            return data;
        },


        ...options,
    });
}
export function useGetRefundRequestDetailById(
    requestId: string,
    options?: Omit<
        UseQueryOptions<
            RefundRequestDetailResponse,
            ApiErrorResponse
        >,
        'queryKey' | 'queryFn'
    >,
) {
    const modeScope = useDeliveriesAdminModeScope();
    return useQuery<
        RefundRequestDetailResponse,
        ApiErrorResponse
    >({
        // IMPORTANT: requestId must be part of queryKey
        queryKey: ['get-refunds-request-details', requestId, modeScope ?? null],

        queryFn: async () => {
            const { data } =
                await Axios.get<RefundRequestDetailResponse>(
                    modeScope
                        ? `/apps/deliveries/admin/refund-responsibilities/requests/${requestId}?modeScope=${modeScope}`
                        : `/apps/deliveries/admin/refund-responsibilities/requests/${requestId}`
                );

            return data;
        },

        // prevents query from running with undefined/empty id
        enabled: !!requestId,

        // optional but recommended for detail pages
        staleTime: 0,
        refetchOnMount: true,

        ...options,
    });
}




export const useApproveRefundRequest = (
    options?: UseMutationOptions<{ message: string; status: string }, ApiErrorResponse, ApproveRefundRequestPayload>
) => {
    const queryClient = useQueryClient();

    return useMutation<{ message: string; status: string }, ApiErrorResponse, ApproveRefundRequestPayload>({
        mutationFn: async (payload: ApproveRefundRequestPayload) => {
            const res = await Axios.post<{ message: string; status: string }>(
                `/apps/deliveries/admin/refund-responsibilities/requests/${payload.id}/approve`,
                payload.ApproveRefundRequest
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['get-refunds-and-responsibilities', 'get-refunds-request-details'],
                exact: false,
                refetchType: 'active',
            });

        },
        ...options,
    });
};
export const useRejectRefundRequest = (
    options?: UseMutationOptions<{ message: string; status: string }, ApiErrorResponse, RejectRefundRequestPayload>
) => {
    const queryClient = useQueryClient();

    return useMutation<{ message: string; status: string }, ApiErrorResponse, RejectRefundRequestPayload>({
        mutationFn: async (payload) => {
            const res = await Axios.post<{ message: string; status: string }>(
                `/apps/deliveries/admin/refund-responsibilities/requests/${payload.id}/reject`,
                payload.internal_note
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['get-refunds-and-responsibilities', 'get-refunds-request-details'],
                exact: false,
                refetchType: 'active',
            });

        },
        ...options,
    });
};
