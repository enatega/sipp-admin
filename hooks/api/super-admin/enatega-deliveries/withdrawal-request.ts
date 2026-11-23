import Axios from "@/config/axios";
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';
import { useQueryParams } from "@/hooks/use-query-params";
import buildFormData from "@/lib/build-form-data";
import { ApiErrorResponse } from "@/types";
import { ApproveLumiFoodWithdrawalRequestResponse, ApproveWithdrawalRequestParams, GetLumiFoodWithdrawalRequestsResponse, GetwithdrawalRequestsQueryParams, RejectLumiFoodWithdrawalRequestResponse, RejectWithdrawalRequestParams } from "@/types/api/super-admin/enatega-deliveries/withdrawal-request.api";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export const useGetwithdrawalRequests = (options?: Omit<UseQueryOptions<GetLumiFoodWithdrawalRequestsResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>) => {
    const { getParam } = useQueryParams();
    const modeScope = useDeliveriesAdminModeScope();
    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const paymentMethod = getParam('paymentMethod') || undefined;
    const tabParam = getParam('status');
    // Normalize tab: treat missing or 'all' as undefined
    const tab = !tabParam || tabParam === 'all' || tabParam === 'vendor_withdrawals' ? 'vendor_withdrawals' : tabParam;
    const withdrawType = (tab.replace('_withdrawals', '')).toUpperCase();
    const shopType = getParam('shopType') || undefined;
    const zoneId = getParam('zoneId') || undefined;
    const endDate = getParam('endDate') || undefined;
    const startDate = getParam('startDate') || undefined;
    const status = getParam('requestStatus') || undefined;

    const params: GetwithdrawalRequestsQueryParams = useMemo(() => ({
        page,
        limit,
        search,
        paymentMethod,
        withdrawType,
        shopType,
        zoneId,
        endDate,
        startDate,
        status,
        modeScope,
    }), [endDate, limit, modeScope, page, paymentMethod, search, shopType, startDate, status, withdrawType, zoneId]);

    const fetchWithdrawalRequests = useCallback(async (
        requestParams: GetwithdrawalRequestsQueryParams
    ): Promise<GetLumiFoodWithdrawalRequestsResponse> => {
        const query = new URLSearchParams();

        Object.entries(requestParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, String(value));
            }
        });

        const res = await Axios.get<GetLumiFoodWithdrawalRequestsResponse>(`/apps/deliveries/withdraws/requests?${query.toString()}`);
        return res.data;
    }, []);

    return useQuery<GetLumiFoodWithdrawalRequestsResponse, ApiErrorResponse>({
        queryKey: ["get-withdrawal-requests", params],
        queryFn: () => fetchWithdrawalRequests(params),
        placeholderData: (previous) => previous,
        ...options,
    
    });
};

export const useRejectWithdrawalRequest = () => {
    const queryClient = useQueryClient();
    return useMutation<
        RejectLumiFoodWithdrawalRequestResponse,
        ApiErrorResponse,
        RejectWithdrawalRequestParams
    >({
        mutationFn: async (params) => {
            const res = await Axios.patch<RejectLumiFoodWithdrawalRequestResponse>(
                `/apps/deliveries/withdraws/${params.id}/reject`,
                { reason: params.reason }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["get-withdrawal-requests"],
                exact: false,
            });
        },

    });
};

export const useApproveWithdrawalRequest = () => {
    const queryClient = useQueryClient();
    return useMutation<
        ApproveLumiFoodWithdrawalRequestResponse,
        ApiErrorResponse,
        ApproveWithdrawalRequestParams
    >({
        mutationFn: async (params) => {
            const { id, ...data } = params;
            const formData = buildFormData(data as Record<string, unknown>);
            const res = await Axios.patch<ApproveLumiFoodWithdrawalRequestResponse>(
                `/apps/deliveries/withdraws/${id}/approve`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return res.data;
        },
        onSuccess: () => {
            // Invalidate the withdrawal requests query
            queryClient.invalidateQueries({
                queryKey: ["get-withdrawal-requests"],
                exact: false,
            });
        },
    });
};
