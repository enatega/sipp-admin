import Axios from '@/config/axios';
import {
  ApiErrorResponse,
} from '@/types';
import type {
  GetCustomerLoyaltyDashboardResponse,
  GetCustomerPointsHistoryResponse,
  GetRiderLoyaltyDashboardResponse,
  GetRiderPointsHistoryResponse,
  LoyaltyTabType,
} from '@/types/api/super-admin/enatega-deliveries/loyalty.api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

const ENDPOINTS = {
  customer: '/apps/deliveries/admin/loyalty-points-range/loyalty-dashboard',
  customerPointsHistory: '/apps/deliveries/admin/dashboard/loyalty-referral/customer-points',
  rider: '/apps/deliveries/admin/rider-loyalty-points-range/loyalty-dashboard',
  riderPointsHistory: '/apps/deliveries/admin/dashboard/loyalty-referral/rider-points',
};

/**
 * Hook to fetch customer loyalty dashboard stats
 * @param options - React Query options
 * @returns Query result with customer dashboard data
 */
export const useGetCustomerLoyaltyDashboard = (
  options?: Omit<
    UseQueryOptions<
      GetCustomerLoyaltyDashboardResponse,
      ApiErrorResponse,
      GetCustomerLoyaltyDashboardResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const queryKey = ['customer-loyalty-dashboard'] as const;

  return useQuery<GetCustomerLoyaltyDashboardResponse, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const res = await Axios.get<GetCustomerLoyaltyDashboardResponse>(
        ENDPOINTS.customer
      );
      return res.data;
    },
    retry: false,
    ...options,
  });
};

/**
 * Hook to fetch rider/rider loyalty dashboard stats
 * @param options - React Query options
 * @returns Query result with rider dashboard data
 */
export const useGetRiderLoyaltyDashboard = (
  options?: Omit<
    UseQueryOptions<
      GetRiderLoyaltyDashboardResponse,
      ApiErrorResponse,
      GetRiderLoyaltyDashboardResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const queryKey = ['rider-loyalty-dashboard'] as const;

  return useQuery<GetRiderLoyaltyDashboardResponse, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const res = await Axios.get<GetRiderLoyaltyDashboardResponse>(
        ENDPOINTS.rider
      );
      return res.data;
    },
    retry: false,
    ...options,
  });
};

/**
 * Hook to fetch loyalty dashboard stats based on tab type
 * @param type - Tab type (customer or rider)
 * @param options - React Query options
 * @returns Query result with dashboard data
 */
export const useGetLoyaltyDashboard = (
  type: LoyaltyTabType,
  options?: Omit<
    UseQueryOptions<
      GetCustomerLoyaltyDashboardResponse | GetRiderLoyaltyDashboardResponse,
      ApiErrorResponse,
      GetCustomerLoyaltyDashboardResponse | GetRiderLoyaltyDashboardResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const endpoint = type === 'customer' ? ENDPOINTS.customer : ENDPOINTS.rider;
  const queryKey = ['loyalty-dashboard', type] as const;

  return useQuery<
    GetCustomerLoyaltyDashboardResponse | GetRiderLoyaltyDashboardResponse,
    ApiErrorResponse
  >({
    queryKey,
    queryFn: async () => {
      const res = await Axios.get(endpoint);
      return res.data;
    },
    retry: false,
    ...options,
  });
};

/**
 * Hook to fetch customer loyalty referral points history
 * @param options - React Query options
 * @returns Query result with customer points history data
 */
export const useGetCustomerPointsHistory = (
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
  const queryKey = ['customer-points-history'] as const;

  return useQuery<GetCustomerPointsHistoryResponse, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const res = await Axios.get<GetCustomerPointsHistoryResponse>(
        ENDPOINTS.customerPointsHistory
      );
      return res.data;
    },
    retry: false,
    ...options,
  });
};

/**
 * Hook to fetch rider loyalty referral points history
 * @param options - React Query options
 * @returns Query result with rider points history data
 */
export const useGetRiderPointsHistory = (
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
  const queryKey = ['rider-points-history'] as const;

  return useQuery<GetRiderPointsHistoryResponse, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const res = await Axios.get<GetRiderPointsHistoryResponse>(
        ENDPOINTS.riderPointsHistory
      );
      return res.data;
    },
    retry: false,
    ...options,
  });
};
