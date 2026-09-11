import Axios from '@/config/axios';
import {
  ApiErrorResponse,
  CreateSubscriptionPlanPayload,
  CreateSubscriptionPlanResponse,
  DeleteSubscriptionPlanResponse,
  GetSingleSubscriptionPlanResponse,
  GetSubscriptionPlanFeaturesResponse,
  GetSubscriptionPlansResponse,
  UpdateSubscriptionPlanPayload,
  UpdateSubscriptionPlanResponse,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

const SUBSCRIPTION_PLANS_QUERY_KEY = ['deliveries-subscription-plans'] as const;
const SUBSCRIPTION_PLANS_ENDPOINT = '/deliveries/subscription-plan';
const SUBSCRIPTION_PLAN_FEATURES_QUERY_KEY = [
  'deliveries-subscription-plan-features',
] as const;
const SUBSCRIPTION_PLAN_FEATURES_ENDPOINT =
  '/deliveries/subscription-plan/feature/all';

const appendIfDefined = (
  formData: FormData,
  key: string,
  value: string | number | boolean | undefined,
) => {
  if (value === undefined) return;
  formData.append(key, String(value));
};

const appendIfDefinedToSearch = (
  search: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined,
) => {
  if (value === undefined) return;
  search.append(key, String(value));
};

export const useGetSubscriptionPlans = (
  options?: Omit<
    UseQueryOptions<GetSubscriptionPlansResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<GetSubscriptionPlansResponse, ApiErrorResponse>({
    queryKey: SUBSCRIPTION_PLANS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await Axios.get<GetSubscriptionPlansResponse>(
        SUBSCRIPTION_PLANS_ENDPOINT,
      );
      return data;
    },
    ...options,
  });

export const useGetSubscriptionPlanFeatures = (
  options?: Omit<
    UseQueryOptions<GetSubscriptionPlanFeaturesResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<GetSubscriptionPlanFeaturesResponse, ApiErrorResponse>({
    queryKey: SUBSCRIPTION_PLAN_FEATURES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await Axios.get<GetSubscriptionPlanFeaturesResponse>(
        SUBSCRIPTION_PLAN_FEATURES_ENDPOINT,
      );
      return data;
    },
    ...options,
  });

export const useGetSingleSubscriptionPlan = (
  id: string,
  options?: Omit<
    UseQueryOptions<GetSingleSubscriptionPlanResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<GetSingleSubscriptionPlanResponse, ApiErrorResponse>({
    queryKey: [...SUBSCRIPTION_PLANS_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await Axios.get<GetSingleSubscriptionPlanResponse>(
        `${SUBSCRIPTION_PLANS_ENDPOINT}/${id}`,
      );
      return data;
    },
    enabled: Boolean(id),
    ...options,
  });

export const useCreateSubscriptionPlan = (
  options?: UseMutationOptions<
    CreateSubscriptionPlanResponse,
    ApiErrorResponse,
    CreateSubscriptionPlanPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateSubscriptionPlanResponse,
    ApiErrorResponse,
    CreateSubscriptionPlanPayload
  >({
    mutationFn: async (payload) => {
      const body = new URLSearchParams();
      body.append('planName', payload.planName);
      appendIfDefinedToSearch(body, 'planDescription', payload.planDescription);
      body.append('monthlyPrice', String(payload.monthlyPrice));
      body.append('yearlyPrice', String(payload.yearlyPrice));
      appendIfDefinedToSearch(body, 'isActive', payload.isActive);
      appendIfDefinedToSearch(body, 'isRecommended', payload.isRecommended);
      body.append('commissionRate', String(payload.commissionRate));
      body.append('freeOrdersIncluded', String(payload.freeOrdersIncluded));
      body.append('bannerDuration', String(payload.bannerDuration));
      appendIfDefinedToSearch(body, 'numberOfOrders', payload.numberOfOrders);
      body.append('isUnlimitedOrders', String(payload.isUnlimitedOrders));
      payload.planFeatureIds.forEach((featureId) => {
        body.append('planFeatureIds', featureId);
      });

      const { data } = await Axios.post<CreateSubscriptionPlanResponse>(
        SUBSCRIPTION_PLANS_ENDPOINT,
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return data;
    },
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_PLANS_QUERY_KEY });
      options?.onSuccess?.(data, variables, context, meta);
    },
    ...options,
  });
};

export const useUpdateSubscriptionPlan = (
  options?: UseMutationOptions<
    UpdateSubscriptionPlanResponse,
    ApiErrorResponse,
    { id: string; payload: UpdateSubscriptionPlanPayload }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateSubscriptionPlanResponse,
    ApiErrorResponse,
    { id: string; payload: UpdateSubscriptionPlanPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const formData = new FormData();
      appendIfDefined(formData, 'planName', payload.planName);
      appendIfDefined(formData, 'planDescription', payload.planDescription);
      appendIfDefined(formData, 'monthlyPrice', payload.monthlyPrice);
      appendIfDefined(formData, 'yearlyPrice', payload.yearlyPrice);
      appendIfDefined(formData, 'isActive', payload.isActive);
      appendIfDefined(formData, 'isRecommended', payload.isRecommended);
      appendIfDefined(formData, 'commissionRate', payload.commissionRate);
      appendIfDefined(formData, 'freeOrdersIncluded', payload.freeOrdersIncluded);
      appendIfDefined(formData, 'bannerDuration', payload.bannerDuration);
      appendIfDefined(formData, 'numberOfOrders', payload.numberOfOrders);
      appendIfDefined(formData, 'isUnlimitedOrders', payload.isUnlimitedOrders);
      payload.planFeatureIds?.forEach((featureId) => {
        formData.append('planFeatureIds', featureId);
      });

      const { data } = await Axios.patch<UpdateSubscriptionPlanResponse>(
        `${SUBSCRIPTION_PLANS_ENDPOINT}/${id}`,
        formData,
      );
      return data;
    },
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_PLANS_QUERY_KEY });
      options?.onSuccess?.(data, variables, context, meta);
    },
    ...options,
  });
};

export const useDeleteSubscriptionPlan = (
  options?: UseMutationOptions<
    DeleteSubscriptionPlanResponse,
    ApiErrorResponse,
    string
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteSubscriptionPlanResponse, ApiErrorResponse, string>({
    mutationFn: async (id: string) => {
      const { data } = await Axios.delete<DeleteSubscriptionPlanResponse>(
        `${SUBSCRIPTION_PLANS_ENDPOINT}/${id}`,
      );
      return data;
    },
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_PLANS_QUERY_KEY });
      options?.onSuccess?.(data, variables, context, meta);
    },
    ...options,
  });
};
