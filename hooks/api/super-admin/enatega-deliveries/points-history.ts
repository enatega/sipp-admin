import Axios from '@/config/axios';
import {
  ApiErrorResponse,
} from '@/types';
import type {
  GetCustomerPointsHistoryResponse,
  GetRiderPointsHistoryResponse,
  LoyaltyTabType,
  PointsHistoryQueryParams,
} from '@/types/api/super-admin/enatega-deliveries/loyalty.api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

const ENDPOINTS = {
  customer: '/apps/deliveries/admin/dashboard/loyalty-referral/customer-points',
  rider: '/apps/deliveries/admin/dashboard/loyalty-referral/rider-points',
};

const DEFAULT_PARAMS: PointsHistoryQueryParams = {
  page: 1,
  limit: 10,
  type: 'all',
};

/**
 * Hook to fetch customer points history
 * @param params - Query parameters (page, limit, type, start_date, end_date)
 * @param options - React Query options
 * @returns Query result with customer points history data
 */
export const useGetCustomerPointsHistory = (
  params?: PointsHistoryQueryParams,
  options?: Omit<
    UseQueryOptions<
      GetCustomerPointsHistoryResponse,
      ApiErrorResponse,
      GetCustomerPointsHistoryResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const queryParams = { ...DEFAULT_PARAMS, ...params };
  const queryKey = ['customer-points-history', queryParams] as const;

  return useQuery<GetCustomerPointsHistoryResponse, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const res = await Axios.get<GetCustomerPointsHistoryResponse>(
        ENDPOINTS.customer,
        { params: queryParams }
      );
      return res.data;
    },
    retry: false,
    ...options,
  });
};

/**
 * Hook to fetch rider/rider points history
 * @param params - Query parameters (page, limit, type, start_date, end_date)
 * @param options - React Query options
 * @returns Query result with rider points history data
 */
export const useGetRiderPointsHistory = (
  params?: PointsHistoryQueryParams,
  options?: Omit<
    UseQueryOptions<
      GetRiderPointsHistoryResponse,
      ApiErrorResponse,
      GetRiderPointsHistoryResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const queryParams = { ...DEFAULT_PARAMS, ...params };
  const queryKey = ['rider-points-history', queryParams] as const;

  return useQuery<GetRiderPointsHistoryResponse, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const res = await Axios.get<GetRiderPointsHistoryResponse>(
        ENDPOINTS.rider,
        { params: queryParams }
      );
      return res.data;
    },
    retry: false,
    ...options,
  });
};

/**
 * Hook to fetch points history based on tab type
 * @param type - Tab type (customer or rider)
 * @param params - Query parameters (page, limit, type, start_date, end_date)
 * @param options - React Query options
 * @returns Query result with points history data
 */
export const useGetPointsHistory = (
  type: LoyaltyTabType,
  params?: PointsHistoryQueryParams,
  options?: Omit<
    UseQueryOptions<
      GetCustomerPointsHistoryResponse | GetRiderPointsHistoryResponse,
      ApiErrorResponse,
      GetCustomerPointsHistoryResponse | GetRiderPointsHistoryResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const queryParams = { ...DEFAULT_PARAMS, ...params };
  const endpoint = type === 'customer' ? ENDPOINTS.customer : ENDPOINTS.rider;
  const queryKey = ['points-history', type, queryParams] as const;

  return useQuery<
    GetCustomerPointsHistoryResponse | GetRiderPointsHistoryResponse,
    ApiErrorResponse
  >({
    queryKey,
    queryFn: async () => {
      const res = await Axios.get(endpoint, { params: queryParams });
      return res.data;
    },
    retry: false,
    ...options,
  });
};
