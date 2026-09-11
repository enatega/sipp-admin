import { useCallback, useMemo } from 'react';
import {
  ApiErrorResponse,
  CreateVendorPayload,
  GetAllVendorsSimpleResponse,
  GetDeliveryVendorProfileResponse,
  GetDeliveryVendorsResponse,
  GetVendorDetailResponse,
  GetVendorsQueryParams,
  UpdateVendorPayload,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import Axios from '@/config/axios';
import buildFormData from '@/lib/build-form-data';
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';
import { useQueryParams } from '@/hooks/use-query-params';

/**
 * Hook to fetch all vendors (simple list with id and name)
 * @param options - React Query options
 */
export const useGetAllVendorsSimple = (
  options?: Omit<
    UseQueryOptions<
      GetAllVendorsSimpleResponse,
      ApiErrorResponse,
      GetAllVendorsSimpleResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const modeScope = useDeliveriesAdminModeScope();
  const queryKey = ['get-all-vendors-simple'];

  return useQuery<GetAllVendorsSimpleResponse, ApiErrorResponse>({
    queryKey: [...queryKey, modeScope ?? null],
    queryFn: async () => {
      const res = await Axios.get<GetAllVendorsSimpleResponse>(
        modeScope
          ? `/apps/deliveries/stores/vendors/all?modeScope=${modeScope}`
          : '/apps/deliveries/stores/vendors/all',
      );
      return res.data;
    },
    ...options,
  });
};

/**
 * Hook to fetch all delivery vendors with pagination and filters
 * @param options - React Query options
 */
export const useGetAllDeliveryVendors = (
  options?: Omit<
    UseQueryOptions<
      GetDeliveryVendorsResponse,
      ApiErrorResponse,
      GetDeliveryVendorsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
  paramsOverride?: Partial<GetVendorsQueryParams>,
) => {
  const { getParam } = useQueryParams();
  const modeScope = useDeliveriesAdminModeScope();

  const urlPage = Number(getParam('page')) || 1;
  const urlLimit = Number(getParam('limit')) || 10;
  const urlSearch = getParam('search') || undefined;
  const urlStatusFilter = getParam('tab') || undefined;
  const urlZoneId = getParam('zoneId') || undefined;
  const urlStartDate = getParam('startDate') || undefined;
  const urlEndDate = getParam('endDate') || undefined;

  const hasTabOverride =
    paramsOverride?.statusFilter !== undefined &&
    paramsOverride?.statusFilter !== urlStatusFilter;

  const page = paramsOverride?.page ?? (hasTabOverride ? 1 : urlPage);
  const limit = paramsOverride?.limit ?? urlLimit;
  const search = paramsOverride?.search ?? urlSearch;
  const statusFilter = paramsOverride?.statusFilter ?? urlStatusFilter;
  const zoneId = paramsOverride?.zoneId ?? urlZoneId;
  const startDate = paramsOverride?.startDate ?? urlStartDate;
  const endDate = paramsOverride?.endDate ?? urlEndDate;

  const params: GetVendorsQueryParams = useMemo(
    () => ({
      page,
      limit,
      search,
      statusFilter,
      zoneId,
      startDate,
      endDate,
      modeScope,
    }),
    [endDate, limit, modeScope, page, search, startDate, statusFilter, zoneId],
  );

  const queryKey = ['get-delivery-vendors', params];

  const fetchVendors = useCallback(
    async (
      requestParams: GetVendorsQueryParams,
    ): Promise<GetDeliveryVendorsResponse> => {
      const query = new URLSearchParams();
      if (requestParams.page !== undefined)
        query.append('page', String(requestParams.page));
      if (requestParams.limit !== undefined)
        query.append('limit', String(requestParams.limit));
      if (requestParams.search) query.append('search', requestParams.search);
      if (requestParams.statusFilter && requestParams.statusFilter !== 'all') {
        query.append('statusFilter', requestParams.statusFilter);
      }
      if (requestParams.zoneId) query.append('zoneId', requestParams.zoneId);
      if (requestParams.startDate)
        query.append('startDate', requestParams.startDate);
      if (requestParams.endDate) query.append('endDate', requestParams.endDate);
      if (
        (requestParams as typeof requestParams & { modeScope?: string })
          .modeScope
      ) {
        query.append(
          'modeScope',
          (requestParams as typeof requestParams & { modeScope?: string })
            .modeScope as string,
        );
      }

      const apiUrl = `/apps/deliveries/vendors/getAllVendors/admin?${query.toString()}`;
      const res = await Axios.get<GetDeliveryVendorsResponse>(apiUrl);
      return res.data;
    },
    [],
  );

  return useQuery<GetDeliveryVendorsResponse, ApiErrorResponse>({
    queryKey,
    queryFn: () => fetchVendors(params),
    retry: false,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    ...options,
  });
};

/**
 * Hook to approve a vendor
 * @param options - React Query mutation options
 */
export const useApproveVendor = (
  options?: UseMutationOptions<
    { message: string; status: string },
    ApiErrorResponse,
    string
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; status: string },
    ApiErrorResponse,
    string
  >({
    mutationFn: async (vendorId: string) => {
      const res = await Axios.patch<{ message: string; status: string }>(
        `/apps/deliveries/vendors/vendor/status`,
        { vendorId, status: 'approved' },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-delivery-vendors'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['get-vendor-detail'],
        exact: false,
      });
    },
    ...options,
  });
};

/**
 * Hook to reject a vendor
 * @param options - React Query mutation options
 */
export const useRejectVendor = (
  options?: UseMutationOptions<
    { message: string; status: string },
    ApiErrorResponse,
    { vendorId: string; rejectionReason: string }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; status: string },
    ApiErrorResponse,
    { vendorId: string; rejectionReason: string }
  >({
    mutationFn: async ({ vendorId, rejectionReason }) => {
      const res = await Axios.patch<{ message: string; status: string }>(
        `/apps/deliveries/vendors/vendor/status`,
        { vendorId, status: 'rejected', rejectionReason },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-delivery-vendors'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['get-vendor-detail'],
        exact: false,
      });
    },
    ...options,
  });
};

/**
 * Hook to toggle vendor block status (block/unblock)
 * @param options - React Query mutation options
 */
export const useToggleVendorBlock = (
  options?: UseMutationOptions<
    { message: string; isBlocked: boolean },
    ApiErrorResponse,
    string
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; isBlocked: boolean },
    ApiErrorResponse,
    string
  >({
    mutationFn: async (vendorId: string) => {
      const res = await Axios.patch<{ message: string; isBlocked: boolean }>(
        `/apps/deliveries/vendors/toggle-block/${vendorId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-delivery-vendors'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['get-vendor-detail'],
        exact: false,
      });
    },
    ...options,
  });
};

/**
 * Hook to delete a vendor
 * @param options - React Query mutation options
 */
export const useDeleteVendor = (
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
    mutationFn: async (vendorId: string) => {
      const res = await Axios.delete<{ message: string; success: boolean }>(
        `/apps/deliveries/vendors/vendor/one/delete/${vendorId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-delivery-vendors'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['get-vendor-detail'],
        exact: false,
      });
    },
    ...options,
  });
};

/**
 * Hook to fetch single vendor details
 * @param vendorId - Vendor ID
 * @param options - React Query options
 */
export const useGetVendorDetail = (
  vendorId: string,
  options?: Omit<
    UseQueryOptions<GetVendorDetailResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<GetVendorDetailResponse, ApiErrorResponse>({
    queryKey: ['get-vendor-detail', vendorId],
    queryFn: async () => {
      const res = await Axios.get<GetVendorDetailResponse>(
        `/apps/deliveries/vendors/${vendorId}`,
      );
      return res.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!vendorId,
    ...options,
  });
};

/**
 * Hook to fetch vendor profile details for details dialog
 * @param vendorId - Vendor ID
 * @param options - React Query options
 */
export const useGetDeliveryVendorProfile = (
  vendorId: string,
  options?: Omit<
    UseQueryOptions<GetDeliveryVendorProfileResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<GetDeliveryVendorProfileResponse, ApiErrorResponse>({
    queryKey: ['get-delivery-vendor-profile', vendorId],
    queryFn: async () => {
      const res = await Axios.get<GetDeliveryVendorProfileResponse>(
        `/apps/deliveries/admin/vendor-profile/${vendorId}`,
      );
      return res.data;
    },
    retry: false,
    enabled: !!vendorId,
    ...options,
  });
};

/**
 * Hook to create a new vendor
 * @param options - React Query mutation options
 */
export const useCreateVendor = (
  options?: UseMutationOptions<
    { message: string; vendor?: unknown },
    ApiErrorResponse,
    CreateVendorPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; vendor?: unknown },
    ApiErrorResponse,
    CreateVendorPayload
  >({
    ...options,
    mutationFn: async (payload: CreateVendorPayload) => {
      const formData = buildFormData(
        payload as unknown as Record<string, unknown>,
        {
          skipNullish: true,
          skipEmpty: false,
        },
      );

      const res = await Axios.post<{ message: string; vendor?: unknown }>(
        '/apps/deliveries/vendors',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return res.data;
    },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: ['get-all-vendors-simple'],
        exact: false,
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({
        queryKey: ['get-delivery-vendors'],
        exact: false,
        refetchType: 'none',
      });
      void queryClient.refetchQueries({
        queryKey: ['get-delivery-vendors'],
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

/**
 * Hook to update a vendor
 * @param options - React Query mutation options
 */
export const useUpdateVendor = (
  options?: UseMutationOptions<
    { message: string; vendor?: unknown },
    ApiErrorResponse,
    { vendorId: string; payload: UpdateVendorPayload }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; vendor?: unknown },
    ApiErrorResponse,
    { vendorId: string; payload: UpdateVendorPayload }
  >({
    mutationFn: async ({ vendorId, payload }) => {
      const formData = buildFormData(
        payload as unknown as Record<string, unknown>,
        {
          skipNullish: true,
          skipEmpty: false,
        },
      );

      const res = await Axios.patch<{ message: string; vendor?: unknown }>(
        `/apps/deliveries/vendors/${vendorId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return res.data;
    },
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({
        queryKey: ['get-delivery-vendors'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['get-vendor-detail', vendorId],
        exact: false,
      });
    },
    ...options,
  });
};
