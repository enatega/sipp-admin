import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
    ApiErrorResponse,
    GetStoreEarningDashboardParams,
    GetStoreEarningDashboardResponse,
    GetStoreEarningViewParams,
    GetStoreEarningViewResponse,
} from '@/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const useGetStoreEarningDashboard = (
    storeId?: string,
    options?: Omit<
        UseQueryOptions<GetStoreEarningDashboardResponse, ApiErrorResponse>,
        'queryKey' | 'queryFn'
    >,
) => {
    const { getParam } = useQueryParams();

    const rawStartDate = getParam('startDate') || undefined;
    const rawEndDate = getParam('endDate') || undefined;
    const startDate = rawStartDate ? new Date(rawStartDate).toISOString() : undefined;
    const endDate = rawEndDate ? new Date(rawEndDate).toISOString() : undefined;
    const period = (rawStartDate && rawEndDate)
        ? 'custom'
        : (getParam('period') as GetStoreEarningDashboardParams['period']) || 'all';

    const params: GetStoreEarningDashboardParams = {
        period,
        startDate,
        endDate,
    };

    return useQuery<GetStoreEarningDashboardResponse, ApiErrorResponse>({
        queryKey: ['get-store-earning-dashboard', storeId, params],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params.period) query.append('period', params.period);
            if (params.startDate) query.append('startDate', params.startDate);
            if (params.endDate) query.append('endDate', params.endDate);

            const qs = query.toString();
            const apiUrl = qs
                ? `/apps/deliveries/store/earning-reports/${storeId}?${qs}`
                : `/apps/deliveries/store/earning-reports/${storeId}`;

            const response = await Axios.get<GetStoreEarningDashboardResponse>(apiUrl);
            return response.data;
        },
        enabled: Boolean(storeId),
        retry: false,
        ...options,
    });
};

export const useGetStoreEarningView = (
    storeId?: string,
    options?: Omit<
        UseQueryOptions<GetStoreEarningViewResponse, ApiErrorResponse>,
        'queryKey' | 'queryFn'
    >,
) => {
    const { getParam } = useQueryParams();

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const rawStartDate = getParam('startDate') || undefined;
    const rawEndDate = getParam('endDate') || undefined;
    const startDate = rawStartDate ? new Date(rawStartDate).toISOString() : undefined;
    const endDate = rawEndDate ? new Date(rawEndDate).toISOString() : undefined;
    const period = (rawStartDate && rawEndDate)
        ? 'custom'
        : (getParam('period') as GetStoreEarningViewParams['period']) || 'all';

    const params: GetStoreEarningViewParams = {
        period,
        startDate,
        endDate,
        page,
        limit,
        search,
    };

    return useQuery<GetStoreEarningViewResponse, ApiErrorResponse>({
        queryKey: ['get-store-earning-view', storeId, params],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params.period) query.append('period', params.period);
            if (params.startDate) query.append('startDate', params.startDate);
            if (params.endDate) query.append('endDate', params.endDate);
            if (params.page) query.append('page', String(params.page));
            if (params.limit) query.append('limit', String(params.limit));
            if (params.search) query.append('search', params.search);

            const qs = query.toString();
            const apiUrl = `/apps/deliveries/store/earning-reports/${storeId}/view?${qs}`;

            const response = await Axios.get<GetStoreEarningViewResponse>(apiUrl);
            return response.data;
        },
        enabled: Boolean(storeId),
        retry: false,
        ...options,
    });
};
