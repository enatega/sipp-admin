import Axios from '@/config/axios';
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';
import { useQueryParams } from '@/hooks/use-query-params';
import { ApiErrorResponse } from '@/types';
import { EnategaDeliveriesDashboardResponse } from '@/types/api/super-admin/enatega-deliveries/dashboard.api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type GetEnategaDeliveriesDashboardStatsOptions = Omit<
  UseQueryOptions<
    EnategaDeliveriesDashboardResponse,
    ApiErrorResponse,
    EnategaDeliveriesDashboardResponse,
    readonly unknown[]
  >,
  'queryKey' | 'queryFn'
>;

export function useGetEnategaDeliveriesDashboardStats(
  options?: GetEnategaDeliveriesDashboardStatsOptions,
) {
  const { getParam } = useQueryParams();
  const modeScope = useDeliveriesAdminModeScope();

  const rawPeriod = getParam('period') || 'all';
  const period =
    rawPeriod === 'daily'
      ? 'today'
      : rawPeriod === 'weekly'
        ? 'this_week'
        : rawPeriod === 'monthly'
          ? 'this_month'
          : rawPeriod === 'yearly'
            ? 'all'
            : rawPeriod;
  // Only include custom range params for the deliveries dashboard API when `period=custom`.
  const startDate = period === 'custom' ? getParam('startDate') || undefined : undefined;
  const endDate = period === 'custom' ? getParam('endDate') || undefined : undefined;

  const queryKey = ['get-enatega-deliveries-dashboard-stats', period, startDate ?? null, endDate ?? null, modeScope ?? null];

  return useQuery<EnategaDeliveriesDashboardResponse, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const query = new URLSearchParams();

      query.append('period', period);
      if (modeScope) query.append('modeScope', modeScope);
      if (period === 'custom') {
        if (startDate) query.append('startDate', startDate);
        // API defaults endDate to today when omitted in custom mode.
        if (endDate) query.append('endDate', endDate);
      }

      const qs = query.toString();
      const apiUrl = qs
        ? `apps/deliveries/admin/dashboard?${qs}`
        : 'apps/deliveries/admin/dashboard';
      const res = await Axios.get<EnategaDeliveriesDashboardResponse>(apiUrl);
      return res.data;
    },
    retry: false,
    ...options,
  });
}
