import Axios from '@/config/axios';
import {
  ApiErrorResponse,
  StoreBillingHistoryResponse,
  StoreCurrentSubscriptionPlanResponse,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

export const useGetStoreCurrentSubscriptionPlan = (
  storeId: string,
  options?: Omit<
    UseQueryOptions<StoreCurrentSubscriptionPlanResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<StoreCurrentSubscriptionPlanResponse, ApiErrorResponse>({
    queryKey: ['store-current-subscription-plan', storeId],
    queryFn: async () => {
      const { data } = await Axios.get<StoreCurrentSubscriptionPlanResponse>(
        `/deliveries/subscription-plan/stripe/store/${storeId}/current-plan`,
      );
      return data;
    },
    enabled: Boolean(storeId),
    retry: false,
    ...options,
  });
};

export const useCancelStoreSubscriptionPlan = (
  options?: UseMutationOptions<
    { message?: string },
    ApiErrorResponse,
    { storeId: string }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message?: string },
    ApiErrorResponse,
    { storeId: string }
  >({
    mutationFn: async ({ storeId }) => {
      const { data } = await Axios.delete<{ message?: string }>(
        `/deliveries/subscription-plan/stripe/store/cancel/${storeId}`,
      );
      return data;
    },
    onSuccess: (...args) => {
      const variables = args[1];
      void queryClient.invalidateQueries({
        queryKey: ['store-current-subscription-plan', variables.storeId],
      });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useGetStoreBillingHistory = (
  storeId: string,
  limit: string,
  options?: Omit<
    UseQueryOptions<StoreBillingHistoryResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<StoreBillingHistoryResponse, ApiErrorResponse>({
    queryKey: ['store-subscription-billing-history', storeId, limit],
    queryFn: async () => {
      const { data } = await Axios.get<StoreBillingHistoryResponse>(
        `/deliveries/subscription-plan/stripe/store/${storeId}/billings/history?limit=${limit}`,
      );
      return data;
    },
    enabled: Boolean(storeId),
    retry: false,
    ...options,
  });
};
