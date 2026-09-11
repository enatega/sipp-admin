import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  GetDeliveryLiveTrackingRiderDetailsResponse,
  GetDeliveryLiveTrackingRiderOverviewResponse,
  GetDeliveryLiveTrackingRidersMapQueryParams,
  GetDeliveryLiveTrackingRidersMapResponse,
  GetDeliveryLiveTrackingRidersQueryParams,
  GetDeliveryLiveTrackingRidersResponse,
} from '@/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

type GetDeliveryLiveTrackingRidersOptions = Omit<
  UseQueryOptions<GetDeliveryLiveTrackingRidersResponse, ApiErrorResponse>,
  'queryKey' | 'queryFn'
>;

type GetDeliveryLiveTrackingRidersMapOptions = Omit<
  UseQueryOptions<GetDeliveryLiveTrackingRidersMapResponse, ApiErrorResponse>,
  'queryKey' | 'queryFn'
>;

type GetDeliveryLiveTrackingRiderDetailsOptions = Omit<
  UseQueryOptions<GetDeliveryLiveTrackingRiderDetailsResponse, ApiErrorResponse>,
  'queryKey' | 'queryFn'
>;

type GetDeliveryLiveTrackingRiderOverviewOptions = Omit<
  UseQueryOptions<GetDeliveryLiveTrackingRiderOverviewResponse, ApiErrorResponse>,
  'queryKey' | 'queryFn'
>;

export const useGetDeliveryLiveTrackingRiders = (
  options?: GetDeliveryLiveTrackingRidersOptions,
) => {
  const { getParam } = useQueryParams();

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;
  const rawStatus = getParam('status') || getParam('tab');
  const status = rawStatus && rawStatus !== 'all' ? rawStatus : undefined;
  const storeId = getParam('storeId') || undefined;
  const vendorId = getParam('vendorId') || undefined;

  const params: GetDeliveryLiveTrackingRidersQueryParams = useMemo(
    () => ({
      page,
      limit,
      search,
      status,
      storeId,
      vendorId,
    }),
    [limit, page, search, status, storeId, vendorId],
  );

  return useQuery<GetDeliveryLiveTrackingRidersResponse, ApiErrorResponse>({
    queryKey: ['delivery-live-tracking-riders', params],
    queryFn: async () => {
      const query = new URLSearchParams();

      if (params.page !== undefined) query.append('page', String(params.page));
      if (params.limit !== undefined)
        query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.storeId) query.append('storeId', params.storeId);
      if (params.vendorId) query.append('vendorId', params.vendorId);

      const qs = query.toString();
      const apiUrl = `/apps/deliveries/live-tracking/riders${qs ? `?${qs}` : ''}`;
      const { data } =
        await Axios.get<GetDeliveryLiveTrackingRidersResponse>(apiUrl);

      return data;
    },
    placeholderData: (previous) => previous,
    ...options,
  });
};

export const useGetDeliveryLiveTrackingRidersMap = (
  options?: GetDeliveryLiveTrackingRidersMapOptions,
) => {
  const { getParam } = useQueryParams();

  const search = getParam('search') || undefined;
  const rawStatus = getParam('status') || getParam('tab');
  const status = rawStatus && rawStatus !== 'all' ? rawStatus : undefined;
  const storeId = getParam('storeId') || undefined;
  const vendorId = getParam('vendorId') || undefined;

  const params: GetDeliveryLiveTrackingRidersMapQueryParams = useMemo(
    () => ({
      search,
      status,
      storeId,
      vendorId,
    }),
    [search, status, storeId, vendorId],
  );

  return useQuery<GetDeliveryLiveTrackingRidersMapResponse, ApiErrorResponse>({
    queryKey: ['delivery-live-tracking-riders-map', params],
    queryFn: async () => {
      const query = new URLSearchParams();

      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.storeId) query.append('storeId', params.storeId);
      if (params.vendorId) query.append('vendorId', params.vendorId);

      const qs = query.toString();
      const apiUrl = `/apps/deliveries/live-tracking/riders/map${qs ? `?${qs}` : ''}`;
      const { data } =
        await Axios.get<GetDeliveryLiveTrackingRidersMapResponse>(apiUrl);

      return data;
    },
    placeholderData: (previous) => previous,
    ...options,
  });
};

export const useGetDeliveryLiveTrackingRiderDetails = (
  riderId?: string | null,
  options?: GetDeliveryLiveTrackingRiderDetailsOptions,
) => {
  return useQuery<GetDeliveryLiveTrackingRiderDetailsResponse, ApiErrorResponse>({
    queryKey: ['delivery-live-tracking-rider-details', riderId],
    queryFn: async () => {
      const { data } = await Axios.get<GetDeliveryLiveTrackingRiderDetailsResponse>(
        `/apps/deliveries/live-tracking/riders/${riderId}`,
      );

      return data;
    },
    enabled: Boolean(riderId),
    ...options,
  });
};

export const useGetDeliveryLiveTrackingRiderOverview = (
  riderId?: string | null,
  options?: GetDeliveryLiveTrackingRiderOverviewOptions,
) => {
  return useQuery<GetDeliveryLiveTrackingRiderOverviewResponse, ApiErrorResponse>({
    queryKey: ['delivery-live-tracking-rider-overview', riderId],
    queryFn: async () => {
      const { data } = await Axios.get<GetDeliveryLiveTrackingRiderOverviewResponse>(
        `/apps/deliveries/live-tracking/riders/${riderId}/overview`,
      );

      return data;
    },
    enabled: Boolean(riderId),
    ...options,
  });
};
