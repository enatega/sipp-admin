import Axios from '@/config/axios';
import {
  ApiErrorResponse,
} from '@/types';
import type {
  GetReferralPointsResponse,
  LoyaltyTabType,
  UpdateReferralPointsPayload,
  UpdateReferralPointsResponse,
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
    ? '/apps/deliveries/admin/referral-rules'
    : '/apps/deliveries/admin/rider-referral-rules';

const getUpdateEndpoint = (type: LoyaltyTabType, id: string) =>
  type === 'customer'
    ? `/apps/deliveries/admin/referral-rules/${id}`
    : `/apps/deliveries/admin/rider-referral-rules/${id}`;

/**
 * Hook to fetch referral points
 * @param type - The tab type (customer or rider)
 * @param options - React Query options
 * @returns Query result with referral points data
 */
export const useGetReferralPoints = (
  type: LoyaltyTabType,
  options?: Omit<
    UseQueryOptions<
      GetReferralPointsResponse,
      ApiErrorResponse,
      GetReferralPointsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const endpoint = getEndpoint(type);
  const queryKey = ['referral-points', type] as const;

  return useQuery<GetReferralPointsResponse, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const res = await Axios.get<GetReferralPointsResponse>(endpoint);
      return res.data;
    },
    retry: false,
    ...options,
  });
};

/**
 * Hook to update referral points
 * @param type - The tab type (customer or rider)
 * @param options - React Query mutation options
 * @returns Mutation result for updating referral points
 */
export const useUpdateReferralPoints = (
  type: LoyaltyTabType,
  options?: UseMutationOptions<
    UpdateReferralPointsResponse,
    ApiErrorResponse,
    { id: string; payload: UpdateReferralPointsPayload }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateReferralPointsResponse,
    ApiErrorResponse,
    { id: string; payload: UpdateReferralPointsPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const endpoint = getUpdateEndpoint(type, id);
      const { data } = await Axios.patch<UpdateReferralPointsResponse>(
        endpoint,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-points', type] });
    },
    ...options,
  });
};
