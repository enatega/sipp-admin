import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import type { GetVendorStoresQueryParams } from '@/types/api/vendor/deliveries/stores.api';
import {
  ApiErrorResponse,
  GetStoreDetailResponse,
  GetVendorStoresResponse,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

type ToggleVendorStoreAvailabilityContext = {
  previousStoresQueries: Array<
    readonly [readonly unknown[], GetVendorStoresResponse | undefined]
  >;
  previousStoreDetail?: GetStoreDetailResponse;
};

export const useGetVendorStores = (
  options?: Omit<
    UseQueryOptions<
      GetVendorStoresResponse,
      ApiErrorResponse,
      GetVendorStoresResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { vendorId } = useParams() as { vendorId?: string };
  const { getParam } = useQueryParams();

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;
  const explicitStatus = getParam('status');
  const tabStatus = getParam('tabStatus');
  const resolvedStatus =
    explicitStatus && explicitStatus !== 'all'
      ? explicitStatus
      : tabStatus && tabStatus !== 'all'
        ? tabStatus
        : undefined;
  const minRating = getParam('minRating') || undefined;
  const shopTypeId = getParam('shopTypeId') || undefined;
  const zoneId = getParam('zoneId') || undefined;
  const startDate = getParam('startDate') || undefined;
  const endDate = getParam('endDate') || undefined;

  const params: GetVendorStoresQueryParams = useMemo(() => ({
    page,
    limit,
    search,
    status: resolvedStatus,
    minRating,
    shopTypeId,
    zoneId,
    startDate,
    endDate,
    vendorId,
  }), [endDate, limit, minRating, page, resolvedStatus, search, shopTypeId, startDate, vendorId, zoneId]);

  const fetchVendorStores = useCallback(async (
    requestParams: GetVendorStoresQueryParams
  ): Promise<GetVendorStoresResponse> => {
    const query = new URLSearchParams();

    if (requestParams.page !== undefined) query.append('page', String(requestParams.page));
    if (requestParams.limit !== undefined) query.append('limit', String(requestParams.limit));
    if (requestParams.search) query.append('search', requestParams.search);
    if (requestParams.status) query.append('status', requestParams.status);
    if (requestParams.minRating) query.append('minRating', requestParams.minRating);
    if (requestParams.shopTypeId) query.append('shopTypeId', requestParams.shopTypeId);
    if (requestParams.zoneId) query.append('zoneId', requestParams.zoneId);
    if (requestParams.startDate) query.append('startDate', requestParams.startDate);
    if (requestParams.endDate) query.append('endDate', requestParams.endDate);
    if (requestParams.vendorId) query.append('vendorId', requestParams.vendorId);

    const { data } = await Axios.get<GetVendorStoresResponse>(
      `/apps/deliveries/stores/vendors/stores?${query.toString()}`,
    );
    return data;
  }, []);

  return useQuery<GetVendorStoresResponse, ApiErrorResponse>({
    queryKey: ['vendor-delivery-stores', params],
    queryFn: () => fetchVendorStores(params),
    enabled: !!vendorId,
    retry: false,
    placeholderData: (previous) => previous,
    ...options,
  });
};

export const useGetVendorStoreDetail = (
  storeId: string,
  options?: Omit<
    UseQueryOptions<GetStoreDetailResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<GetStoreDetailResponse, ApiErrorResponse>({
    queryKey: ['vendor-store-detail', storeId],
    queryFn: async () => {
      const { data } = await Axios.get<GetStoreDetailResponse>(
        `/apps/deliveries/stores/vendors/stores/${storeId}`,
      );
      return data;
    },
    enabled: !!storeId,
    retry: false,
    ...options,
  });
};

export const useToggleVendorStoreAvailability = (
  options?: UseMutationOptions<
    { message: string; status: string },
    ApiErrorResponse,
    string,
    ToggleVendorStoreAvailabilityContext
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; status: string },
    ApiErrorResponse,
    string,
    ToggleVendorStoreAvailabilityContext
  >({
    ...options,
    mutationFn: async (storeId: string) => {
      const { data } = await Axios.patch<{ message: string; status: string }>(
        `/apps/deliveries/stores/${storeId}/admin-vendor-toggle-availability`,
      );
      return data;
    },
    retry: false,
    onMutate: async (storeId) => {
      await queryClient.cancelQueries({
        queryKey: ['vendor-delivery-stores'],
        exact: false,
      });
      await queryClient.cancelQueries({
        queryKey: ['vendor-store-detail', storeId],
        exact: true,
      });

      const previousStoresQueries =
        queryClient.getQueriesData<GetVendorStoresResponse>({
          queryKey: ['vendor-delivery-stores'],
        });
      const previousStoreDetail = queryClient.getQueryData<GetStoreDetailResponse>(
        ['vendor-store-detail', storeId],
      );

      previousStoresQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<GetVendorStoresResponse>(queryKey, (current) => {
          if (!current) return current;

          return {
            ...current,
            data: current.data.map((store) =>
              store.id === storeId
                ? { ...store, isavailable: !store.isavailable }
                : store,
            ),
          };
        });
      });

      queryClient.setQueryData<GetStoreDetailResponse>(
        ['vendor-store-detail', storeId],
        (current) =>
          current
            ? {
                ...current,
                isavailable: !current.isavailable,
              }
            : current,
      );

      return {
        previousStoresQueries,
        previousStoreDetail,
      };
    },
    onSuccess: (...args) => {
      options?.onSuccess?.(...args);
    },
    onError: (error, storeId, context, ...rest) => {
      context?.previousStoresQueries.forEach(([queryKey, previousData]) => {
        queryClient.setQueryData(queryKey, previousData);
      });

      queryClient.setQueryData(
        ['vendor-store-detail', storeId],
        context?.previousStoreDetail,
      );

      options?.onError?.(error, storeId, context, ...rest);
    },
    onSettled: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-delivery-stores'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['vendor-store-detail'],
        exact: false,
      });
      options?.onSettled?.(...args);
    },
  });
};

export const useUpdateVendorStore = (
  options?: UseMutationOptions<
    { message: string },
    ApiErrorResponse,
    { storeId: string; formData: FormData }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string },
    ApiErrorResponse,
    { storeId: string; formData: FormData }
  >({
    ...options,
    mutationFn: async ({ storeId, formData }) => {
      const { data } = await Axios.patch<{ message: string }>(
        `/apps/deliveries/stores/vendors/stores/${storeId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-store-detail'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['vendor-delivery-stores'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
    onError: (...args) => {
      options?.onError?.(...args);
    },
    onSettled: (...args) => {
      options?.onSettled?.(...args);
    },
  });
};

export const useDeleteVendorStore = (
  options?: UseMutationOptions<
    { message: string; success: boolean },
    ApiErrorResponse,
    string
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; success: boolean },
    ApiErrorResponse,
    string
  >({
    ...options,
    mutationFn: async (storeId: string) => {
      const { data } = await Axios.delete<{ message: string; success: boolean }>(
        `/apps/deliveries/stores/vendors/stores/${storeId}`,
      );
      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-store-detail'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['vendor-delivery-stores'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['get-delivery-vendors'],
        exact: false,
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['get-vendor-detail'],
        exact: false,
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['get-all-vendors-simple'],
        exact: false,
        refetchType: 'all',
      });
      options?.onSuccess?.(...args);
    },
    onError: (...args) => {
      options?.onError?.(...args);
    },
    onSettled: (...args) => {
      options?.onSettled?.(...args);
    },
  });
};

/**
 * Hook to create a new store
 * @param options - React Query mutation options
 */
export const useCreateStore = (
  options?: UseMutationOptions<CreateVendorStoreResponse, ApiErrorResponse, FormData>,
) => {
  const queryClient = useQueryClient();

  return useMutation<CreateVendorStoreResponse, ApiErrorResponse, FormData>({
    ...options,
    mutationFn: async (formData: FormData) => {
      const res = await Axios.post<CreateVendorStoreResponse>(
        `/apps/deliveries/stores/main-store`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return res.data;
    },
    retry: false,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: ['vendor-store-detail'],
        exact: false,
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({
        queryKey: ['vendor-delivery-stores'],
        exact: false,
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({
        queryKey: ['get-delivery-stores'],
        exact: false,
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({
        queryKey: ['get-store-detail'],
        exact: false,
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({
        queryKey: ['get-all-simple-stores'],
        exact: false,
        refetchType: 'none',
      });

      void queryClient.refetchQueries({
        queryKey: ['vendor-delivery-stores'],
        exact: false,
        type: 'all',
      });
      void queryClient.refetchQueries({
        queryKey: ['get-delivery-stores'],
        exact: false,
        type: 'all',
      });

      options?.onSuccess?.(...args);
    },
    onError: (...args) => {
      options?.onError?.(...args);
    },
    onSettled: (...args) => {
      options?.onSettled?.(...args);
    },
  });
};

type CreateVendorStoreResponse = {
  message?: string;
  id?: string;
  storeId?: string;
  store?: {
    id?: string;
  };
  data?: {
    id?: string;
    storeId?: string;
    store?: {
      id?: string;
    };
  };
};
