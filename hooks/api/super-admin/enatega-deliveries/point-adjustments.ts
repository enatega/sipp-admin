import Axios from '@/config/axios';
import {
  ApiErrorResponse,
} from '@/types';
import type {
  CreateCustomerPointAdjustmentPayload,
  CreateCustomerPointAdjustmentResponse,
  CreateRiderPointAdjustmentPayload,
  CreateRiderPointAdjustmentResponse,
  GetCustomerPointsResponse,
  GetRiderPointsResponse,
  UpdateCustomerPointAdjustmentResponse,
  UpdateRiderPointAdjustmentResponse,
} from '@/types/api/super-admin/enatega-deliveries/loyalty.api';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

// Rider Points Adjustments
const RIDER_ENDPOINTS = {
  create: '/apps/deliveries/admin/rider-point-adjustments/referral/create',
  updatePoints: (id: string) =>
    `/apps/deliveries/admin/rider-point-adjustments/referral/update-points/${id}`,
  getRiderPoints: '/apps/deliveries/admin/rider-point-adjustments/referral/get-rider-points',
};

/**
 * Hook to create rider point adjustment
 */
export const useCreateRiderPointAdjustment = (
  options?: UseMutationOptions<
    CreateRiderPointAdjustmentResponse,
    ApiErrorResponse,
    CreateRiderPointAdjustmentPayload
  >
) => {
  return useMutation<
    CreateRiderPointAdjustmentResponse,
    ApiErrorResponse,
    CreateRiderPointAdjustmentPayload
  >({
    mutationFn: async (payload) => {
      const { data } = await Axios.post<CreateRiderPointAdjustmentResponse>(
        RIDER_ENDPOINTS.create,
        payload
      );
      return data;
    },
    ...options,
  });
};

/**
 * Hook to update rider points
 */
export const useUpdateRiderPoints = (
  options?: UseMutationOptions<
    UpdateRiderPointAdjustmentResponse,
    ApiErrorResponse,
    { id: string; payload: CreateRiderPointAdjustmentPayload }
  >
) => {
  return useMutation<
    UpdateRiderPointAdjustmentResponse,
    ApiErrorResponse,
    { id: string; payload: CreateRiderPointAdjustmentPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await Axios.put<UpdateRiderPointAdjustmentResponse>(
        RIDER_ENDPOINTS.updatePoints(id),
        payload
      );
      return data;
    },
    ...options,
  });
};

/**
 * Hook to get rider points
 */
export const useGetRiderPoints = (
  options?: Omit<
    UseQueryOptions<
      GetRiderPointsResponse,
      ApiErrorResponse,
      GetRiderPointsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<GetRiderPointsResponse, ApiErrorResponse>({
    queryKey: ['rider-points'],
    queryFn: async () => {
      const res = await Axios.get<GetRiderPointsResponse>(RIDER_ENDPOINTS.getRiderPoints);
      return res.data;
    },
    retry: false,
    ...options,
  });
};

// Customer Points Adjustments
const CUSTOMER_ENDPOINTS = {
  create: '/apps/deliveries/customer-point-adjustments/referral/create',
  updatePoints: (id: string) =>
    `/apps/deliveries/customer-point-adjustments/referral/update-points/${id}`,
  getCustomerPoints: '/apps/deliveries/customer-point-adjustments/referral/get-customer-points',
};

/**
 * Hook to create customer point adjustment
 */
export const useCreateCustomerPointAdjustment = (
  options?: UseMutationOptions<
    CreateCustomerPointAdjustmentResponse,
    ApiErrorResponse,
    CreateCustomerPointAdjustmentPayload
  >
) => {
  return useMutation<
    CreateCustomerPointAdjustmentResponse,
    ApiErrorResponse,
    CreateCustomerPointAdjustmentPayload
  >({
    mutationFn: async (payload) => {
      const { data } = await Axios.post<CreateCustomerPointAdjustmentResponse>(
        CUSTOMER_ENDPOINTS.create,
        payload
      );
      return data;
    },
    ...options,
  });
};

/**
 * Hook to update customer points
 */
export const useUpdateCustomerPoints = (
  options?: UseMutationOptions<
    UpdateCustomerPointAdjustmentResponse,
    ApiErrorResponse,
    { id: string; payload: CreateCustomerPointAdjustmentPayload }
  >
) => {
  return useMutation<
    UpdateCustomerPointAdjustmentResponse,
    ApiErrorResponse,
    { id: string; payload: CreateCustomerPointAdjustmentPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await Axios.put<UpdateCustomerPointAdjustmentResponse>(
        CUSTOMER_ENDPOINTS.updatePoints(id),
        payload
      );
      return data;
    },
    ...options,
  });
};

/**
 * Hook to get customer points
 */
export const useGetCustomerPoints = (
  options?: Omit<
    UseQueryOptions<
      GetCustomerPointsResponse,
      ApiErrorResponse,
      GetCustomerPointsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<GetCustomerPointsResponse, ApiErrorResponse>({
    queryKey: ['customer-points'],
    queryFn: async () => {
      const res = await Axios.get<GetCustomerPointsResponse>(CUSTOMER_ENDPOINTS.getCustomerPoints);
      return res.data;
    },
    retry: false,
    ...options,
  });
};
