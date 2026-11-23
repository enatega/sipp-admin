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
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useMemo } from 'react';

type GetDeliveryLiveTrackingRidersOptions = {
  enabled?: boolean;
};

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

const getRiderStatusFilter = (value: string | null) =>
  value === 'active' || value === 'busy' || value === 'offline'
    ? value
    : undefined;

const LIVE_TRACKING_RIDERS_PAGE_SIZE = 20;

// Infinite list: the rider panel loads more pages as the user scrolls instead of
// stopping at the first page.
export const useGetDeliveryLiveTrackingRiders = (
  options?: GetDeliveryLiveTrackingRidersOptions,
) => {
  const { getParam } = useQueryParams();

  const limit = Number(getParam('limit')) || LIVE_TRACKING_RIDERS_PAGE_SIZE;
  const search = getParam('search') || undefined;
  const rawStatus = getParam('status') || getParam('tab');
  const status = getRiderStatusFilter(rawStatus);
  const storeId = getParam('storeId') || undefined;
  const vendorId = getParam('vendorId') || undefined;

  const params: Omit<GetDeliveryLiveTrackingRidersQueryParams, 'page'> = useMemo(
    () => ({
      limit,
      search,
      status,
      storeId,
      vendorId,
    }),
    [limit, search, status, storeId, vendorId],
  );

  return useInfiniteQuery<
    GetDeliveryLiveTrackingRidersResponse,
    ApiErrorResponse,
    InfiniteData<GetDeliveryLiveTrackingRidersResponse>,
    [string, typeof params],
    number
  >({
    queryKey: ['delivery-live-tracking-riders', params],
    queryFn: async ({ pageParam }) => {
      const query = new URLSearchParams();

      query.append('page', String(pageParam));
      if (params.limit !== undefined)
        query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.storeId) query.append('storeId', params.storeId);
      if (params.vendorId) query.append('vendorId', params.vendorId);

      const apiUrl = `/apps/deliveries/live-tracking/riders?${query.toString()}`;
      const { data } =
        await Axios.get<GetDeliveryLiveTrackingRidersResponse>(apiUrl);

      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
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
  const status = getRiderStatusFilter(rawStatus);
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
