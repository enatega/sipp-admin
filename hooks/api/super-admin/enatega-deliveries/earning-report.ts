import Axios from "@/config/axios";
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';
import { useQueryParams } from '@/hooks/use-query-params';
import { ApiErrorResponse, GetEarningDashboardParams, GetEarningDashboardResponse, GetEarningViewParams, GetEarningViewResponse } from "@/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export const useGetEarningReport = (params?: GetEarningDashboardParams, options?: Omit<UseQueryOptions<GetEarningDashboardResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>) => {
    const { getParam } = useQueryParams();
    const modeScope = useDeliveriesAdminModeScope();
    const rawPeriod = getParam('period') || 'all';
    const mappedPeriod =
        rawPeriod === 'daily'
            ? 'today'
            : rawPeriod === 'weekly'
                ? 'this_week'
                : rawPeriod === 'monthly'
                    ? 'this_month'
                    : rawPeriod === 'yearly'
                        ? 'all'
                        : rawPeriod;
    const allowedPeriods: NonNullable<GetEarningDashboardParams['period']>[] = ['today', 'this_week', 'this_month', 'all', 'custom'];
    const period = allowedPeriods.includes(mappedPeriod as NonNullable<GetEarningDashboardParams['period']>)
        ? (mappedPeriod as NonNullable<GetEarningDashboardParams['period']>)
        : undefined;
    const startDate = period === 'custom' ? getParam('startDate') || undefined : undefined;
    const endDate = period === 'custom' ? getParam('endDate') || undefined : undefined;

    const requestParams: GetEarningDashboardParams = {
        ...params,
        period,
        startDate,
        endDate,
        modeScope,
    };

    return useQuery<GetEarningDashboardResponse, ApiErrorResponse>({
        queryKey: ['get-earning-dashboard', requestParams],
        queryFn: async () => {
            const response = await Axios.get<GetEarningDashboardResponse>('/apps/deliveries/admin/earning-reports', {
                params: requestParams
            })
            return response.data
        },
        ...options
    })
}


export const useGetEarningView = (options?: Omit<UseQueryOptions<GetEarningViewResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>) => {
    const { getParam } = useQueryParams();
    const modeScope = useDeliveriesAdminModeScope();

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const shopTypeId = getParam('shopTypeId') || undefined;
    const rawStartDate = getParam('startDate') || undefined;
    const rawEndDate = getParam('endDate') || undefined;

    // Convert to ISO 8601 format for the API
    const startDate = rawStartDate ? new Date(rawStartDate).toISOString() : undefined;
    const endDate = rawEndDate ? new Date(rawEndDate).toISOString() : undefined;
    const period = (rawStartDate && rawEndDate) ? 'custom' : undefined;

    const params: GetEarningViewParams = {
        page,
        limit,
        search,
        period,
        shopTypeId,
        startDate,
        endDate,
        modeScope,
    };

    return useQuery<GetEarningViewResponse, ApiErrorResponse>({

        queryKey: ['get-earning-view', params],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params.page !== undefined) query.append('page', String(params.page));
            if (params.limit !== undefined) query.append('limit', String(params.limit));
            if (params.search) query.append('search', params.search);
            if (params.period) query.append('period', params.period);
            if (params.shopTypeId) query.append('shopTypeId', params.shopTypeId);
            if (params.startDate) query.append('startDate', params.startDate);
            if (params.endDate) query.append('endDate', params.endDate);
            if ((params as typeof params & { modeScope?: string }).modeScope) query.append('modeScope', (params as typeof params & { modeScope?: string }).modeScope as string);

            const apiUrl = `/apps/deliveries/admin/earning-reports/view?${query.toString()}`;
            const response = await Axios.get<GetEarningViewResponse>(apiUrl);
            return response.data
        },
        ...options
    })
}
