import Axios from "@/config/axios";
import { useQueryParams } from "@/hooks/use-query-params";
import { AccountStatus, ApiErrorResponse, BlockUnblockUserPayload, CreateImpersonationTokenResponse, DeactivateUserPayload, GetUMUserDetailsResponse, GetUserAddressesResponse, GetUserAuditLogsResponse, GetUserHistoryResponse, GetUserManagementQueryParams, GetUserManagementResponse, GetUserOrdersResponse, GetUserReviewsResponse, MessageResponse, RegistrationMethod, UpdateInternalNotePayload, UpdateInternalNoteResponse } from "@/types";
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";



export const useGetUserManagement = (
    options?: Omit<UseQueryOptions<GetUserManagementResponse, ApiErrorResponse, GetUserManagementResponse, readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
    const { getParam } = useQueryParams();

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const fromDate = getParam('fromDate') || undefined;
    const toDate = getParam('toDate') || undefined;

    // Handle multiple RegistrationMethod values
    const registrationMethods = getParam('registrationMethod');
    const registrationMethodArray = registrationMethods
        ? (Array.isArray(registrationMethods) ? registrationMethods : [registrationMethods]) as RegistrationMethod[]
        : undefined;

    // Handle multiple AccountStatus values
    const accountStatuses = getParam('status');
    const accountStatusArray = accountStatuses
        ? (Array.isArray(accountStatuses) ? accountStatuses : [accountStatuses]) as AccountStatus[]
        : undefined;

    const params: GetUserManagementQueryParams = {
        page,
        limit,
        RegistrationMethod: registrationMethodArray,
        AccountStatus: accountStatusArray,
        search,
        fromDate,
        toDate,
    };


    const queryKey = ['get-user-management', params];
    return useQuery<GetUserManagementResponse, ApiErrorResponse>({
        queryKey,
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params.page !== undefined) query.append('page', String(params.page));
            if (params.limit !== undefined) query.append('limit', String(params.limit));
            if (params.RegistrationMethod) {
                params.RegistrationMethod.forEach(method => query.append('RegistrationMethod', method));
            }
            if (params.AccountStatus) {
                params.AccountStatus.forEach(status => query.append('AccountStatus', status));
            }
            if (params.search) query.append('search', params.search);
            if (params.fromDate) query.append('fromDate', params.fromDate);
            if (params.toDate) query.append('toDate', params.toDate);

            const apiUrl = `/user-management/all?${query.toString()}`;
            const res = await Axios.get<GetUserManagementResponse>(apiUrl);
            return res.data;
        },
        ...options,
    });
};



export const useUpdateInternalNote = () => {
    return useMutation<UpdateInternalNoteResponse, ApiErrorResponse, UpdateInternalNotePayload>({
        mutationFn: async (payload) => {
            const { data } = await Axios.patch(
                '/user-management/internal-note',
                payload,
            );
            return data;
        },
    });
};

export const useForceLogout = () => {
    return useMutation<MessageResponse, ApiErrorResponse, string>({
        mutationFn: async (userId: string) => {
            const { data } = await Axios.patch(
                `/user-management/force-logout/${userId}`
            );
            return data;
        },
    });
};

export const useCreateImpersonationToken = () => {
    return useMutation<CreateImpersonationTokenResponse, ApiErrorResponse, string>({
        mutationFn: async (userId: string) => {
            const { data } = await Axios.post<CreateImpersonationTokenResponse>(
                `/user-management/${userId}/impersonation`,
            );
            return data;
        },
    });
};

export const useBlockUnblockUser = () => {
    return useMutation<MessageResponse, ApiErrorResponse, BlockUnblockUserPayload>({
        mutationFn: async (payload) => {
            const { data } = await Axios.patch(
                '/user-management/block-unblock',
                payload,
            );
            return data;
        },
    });
};

export const useDeactivateUser = () => {
    return useMutation<MessageResponse, ApiErrorResponse, DeactivateUserPayload>({
        mutationFn: async (payload) => {
            const { data } = await Axios.patch(
                '/user-management/deactivate',
                payload,
            );
            return data;
        },
    });
};

export const useGetUserDetails = (userId: string) => {
    return useQuery<GetUMUserDetailsResponse, ApiErrorResponse>({
        queryKey: ['get-user-details', userId],
        queryFn: async () => {
            const res = await Axios.get<GetUMUserDetailsResponse>(`/user-management/${userId}`);
            return res.data;
        },
        enabled: !!userId,
    });
};

export const useGetUserOrders = (userId: string) => {
    const { getParam } = useQueryParams();
    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;

    return useQuery<GetUserOrdersResponse, ApiErrorResponse>({
        queryKey: ['get-user-orders', userId, page, limit],
        queryFn: async () => {
            const res = await Axios.get<GetUserHistoryResponse>(`/users/history?userId=${userId}`);
            const normalized = (res.data ?? []).map((item) => ({
                rideId: item.orderId,
                rideDate: item.createdAt,
                amount: item.amount,
                status: item.status,
                type: item.orderType,
                app: item.app,
            }));

            const total = normalized.length;
            const start = (page - 1) * limit;
            const end = start + limit;

            return {
                data: normalized.slice(start, end),
                total,
                page,
                limit,
            };
        },
        enabled: !!userId,
    });
};

export const useGetUserReviews = (userId: string) => {
    const { getParam } = useQueryParams();
    const type = (getParam('type') as 'given' | 'received') || 'given';
    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;

    return useQuery<GetUserReviewsResponse, ApiErrorResponse>({
        queryKey: ['get-user-reviews', userId, type, page, limit],
        queryFn: async () => {
            const query = new URLSearchParams();
            query.append('type', type);
            query.append('page', String(page));
            query.append('limit', String(limit));
            const res = await Axios.get<GetUserReviewsResponse>(`/user-management/${userId}/reviews?${query.toString()}`);
            return res.data;
        },
        enabled: !!userId,
        retry: false
    });
};

export const useGetUserAddresses = (userId: string) => {
    return useQuery<GetUserAddressesResponse, ApiErrorResponse>({
        queryKey: ['get-user-addresses', userId],
        queryFn: async () => {
            const res = await Axios.get<GetUserAddressesResponse>(`/user-management/user_addresses/${userId}`);
            return res.data;
        },
        enabled: !!userId,
        retry: false
        
    });
};

export const useGetUserAuditLogs = (userId: string) => {
    return useQuery<GetUserAuditLogsResponse, ApiErrorResponse>({
        queryKey: ['get-user-audit-logs', userId],
        queryFn: async () => {
            const res = await Axios.get<GetUserAuditLogsResponse>(`/audit/user/${userId}`);
            return res.data;
        },
        enabled: !!userId,
        retry: false
    });
};
