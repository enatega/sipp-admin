import Axios from "@/config/axios";
import { useQueryParams } from "@/hooks/use-query-params";
import { ApiErrorResponse, CreateStoreWithdrawalRequestPayload, CreateStoreWithdrawalRequestResponse, GetStoreBankDetailsResponse, GetStoreWalletSummaryResponse, GetStoreWithdrawRequestsQueryParams, GetStoreWithdrawRequestsResponse } from "@/types";
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

export const useGetStoreWithdrawRequests = (storeId: string, options?: Omit<UseQueryOptions<GetStoreWithdrawRequestsResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>) => {
    const { getParam } = useQueryParams();
    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const status = getParam('status') || undefined;
    const startDate = getParam('startDate') || undefined;
    const endDate = getParam('endDate') || undefined;

    const params: GetStoreWithdrawRequestsQueryParams = {
        page,
        limit,
        search,
        status,
        startDate,
        endDate,
    };

    return useQuery<GetStoreWithdrawRequestsResponse, ApiErrorResponse>({
        queryKey: ["get-store-withdraw-requests", storeId, params],
        queryFn: async () => {
            const query = new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    query.append(key, String(value));
                }
            });

            const res = await Axios.get<GetStoreWithdrawRequestsResponse>(`/apps/store/withdraws/requests/${storeId}?${query.toString()}`);
            return res.data;
        },
        enabled: Boolean(storeId),
        retry: false,
        ...options,
    });
};


export const useGetStoreBankDetails = (storeId: string, options?: Omit<UseQueryOptions<GetStoreBankDetailsResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>) => {
    return useQuery<GetStoreBankDetailsResponse, ApiErrorResponse>({
        queryKey: ["get-store-bank-details", storeId],
        queryFn: async () => {
            const res = await Axios.get<GetStoreBankDetailsResponse>(`/apps/store/withdraws/${storeId}/store-bank-details`);
            return res.data;
        },
        ...options,
    });
};

export const useGetStoreWalletSummary = (storeId: string, options?: Omit<UseQueryOptions<GetStoreWalletSummaryResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>) => {
    return useQuery<GetStoreWalletSummaryResponse, ApiErrorResponse>({
        queryKey: ["get-store-wallet-summary", storeId],
        queryFn: async () => {
            const res = await Axios.get<GetStoreWalletSummaryResponse>(`/apps/store/withdraws/${storeId}/wallet-balance`);
            return res.data;
        },
        enabled: Boolean(storeId),
        retry: false,
        ...options,
    });
};

export const useCreateStoreWithdrawalRequest = (storeId: string, options?: UseMutationOptions<CreateStoreWithdrawalRequestResponse, ApiErrorResponse, CreateStoreWithdrawalRequestPayload>) => {

    const queryClient = useQueryClient();

    return useMutation<CreateStoreWithdrawalRequestResponse, ApiErrorResponse, CreateStoreWithdrawalRequestPayload>({
        ...options,
        mutationFn: async (data: CreateStoreWithdrawalRequestPayload) => {
            const res = await Axios.post<CreateStoreWithdrawalRequestResponse>(`/apps/store/withdraws/${storeId}/create`, {
                store_id: storeId,
                withdrawal_amount: data.withdrawal_amount,
                bank_id: data.bank_id,
                additional_notes: data.additional_notes || "",
            });
            return res.data;
        },
        onSuccess: (...args) => {
            queryClient.invalidateQueries({
                queryKey: ['get-store-withdraw-requests'],
                exact: false,
                refetchType: 'all',
            });
            queryClient.invalidateQueries({
                queryKey: ['get-store-wallet-summary', storeId],
                refetchType: 'all',
            });
            options?.onSuccess?.(...args);
        },
    });

}
