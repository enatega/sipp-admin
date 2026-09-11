import Axios from '@/config/axios';
import {
  ApiErrorResponse,
} from '@/types';
import type {
  LoyaltyTabType,
  PointsToBalanceResponse,
  UpdatePointsToBalancePayload,
} from '@/types/api/super-admin/enatega-deliveries/loyalty.api';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

const getEndpoint = (type: LoyaltyTabType) =>
  type === 'customer'
    ? '/apps/deliveries/customer-points-to-balance'
    : '/apps/deliveries/rider-points-to-balance';

/**
 * Hook to fetch points to balance conversion settings
 * @param type - The tab type (customer or rider)
 * @param options - React Query options
 * @returns Query result with points to balance data
 */
export const useGetPointsToBalance = (
  type: LoyaltyTabType,
  options?: Omit<
    UseQueryOptions<
      PointsToBalanceResponse,
      ApiErrorResponse,
      PointsToBalanceResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const endpoint = getEndpoint(type);
  const queryKey = ['points-to-balance', type] as const;

  return useQuery<PointsToBalanceResponse, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const res = await Axios.get<PointsToBalanceResponse>(endpoint);
      return res.data;
    },
    retry: false,
    ...options,
  });
};

/**
 * Hook to update points to balance conversion settings
 * @param type - The tab type (customer or rider)
 * @param options - React Query mutation options
 * @returns Mutation result for updating points to balance
 */
export const useUpdatePointsToBalance = (
  type: LoyaltyTabType,
  options?: UseMutationOptions<
    PointsToBalanceResponse,
    ApiErrorResponse,
    UpdatePointsToBalancePayload
  >
) => {
  const queryClient = useQueryClient();
  const endpoint = getEndpoint(type);

  return useMutation<
    PointsToBalanceResponse,
    ApiErrorResponse,
    UpdatePointsToBalancePayload
  >({
    mutationFn: async (payload) => {
      const { data } = await Axios.put<PointsToBalanceResponse>(
        endpoint,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-to-balance', type] });
    },
    ...options,
  });
};
