import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  GetStoreDashboardResponse,
  StoreDashboardPeriod,
} from '@/types';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

const ALLOWED_PERIODS: StoreDashboardPeriod[] = [
  'all',
  'today',
  'this_week',
  'this_month',
  'custom',
];

export const useStoreDashboard = (
  options?: Omit<
    UseQueryOptions<GetStoreDashboardResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();
  const { storeId } = useParams() as { storeId?: string };

  const rawPeriod = getParam('period');
  const period = ALLOWED_PERIODS.includes(rawPeriod as StoreDashboardPeriod)
    ? (rawPeriod as StoreDashboardPeriod)
    : 'all';
  const startDate = period === 'custom' ? getParam('startDate') || undefined : undefined;
  const endDate = period === 'custom' ? getParam('endDate') || undefined : undefined;

  return useQuery<GetStoreDashboardResponse, ApiErrorResponse>({
    queryKey: ['get-store-dashboard', storeId, period, startDate ?? null, endDate ?? null],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append('period', period);
      if (period === 'custom') {
        if (startDate) query.append('startDate', startDate);
        if (endDate) query.append('endDate', endDate);
      }

      const apiUrl = `/apps/deliveries/store/dashboard/${storeId}?${query.toString()}`;
      const response = await Axios.get<GetStoreDashboardResponse>(apiUrl);

      return response.data;
    },
    enabled: Boolean(storeId),
    retry: false,
    ...options,
  });
};
