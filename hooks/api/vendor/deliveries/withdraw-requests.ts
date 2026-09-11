
import {
  ApiErrorResponse,
  ApproveVendorWithdrawPayload,
  ApproveVendorWithdrawResponse,

  RejectVendorWithdrawPayload,
  RejectVendorWithdrawResponse,

  CreateVendorStoreWithdrawRequestBody,
  CreateVendorStoreWithdrawRequestResponse,
  GetVendorStoreBankDetailsQueryParams,
  GetVendorStoreBankDetailsResponse,
  GetVendorStoreWithdrawRequestsQueryParams,
  GetVendorStoreWithdrawRequestsResponse,
  GetVendorWithdrawRequestStoresQueryParams,
  GetVendorWithdrawRequestStoresResponse,
  VendorStoreBankDetail,
  VendorStoreWithdrawalStore,
} from '@/types';
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import { useCallback, useMemo } from 'react';

type VendorWithdrawRequestStoresApiResponse =
  | VendorStoreWithdrawalStore[]
  | GetVendorWithdrawRequestStoresResponse;

type VendorStoreBankDetailsApiResponse =
  | VendorStoreBankDetail[]
  | GetVendorStoreBankDetailsResponse;

export const useGetVendorStoreWithdrawRequests = (
  options?: Omit<
    UseQueryOptions<GetVendorStoreWithdrawRequestsResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();
  const { vendorId } = useParams() as { vendorId?: string };

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;
  const status = getParam('status') || undefined;
  const startDate = getParam('startDate') || undefined;
  const endDate = getParam('endDate') || undefined;

  const params: GetVendorStoreWithdrawRequestsQueryParams = useMemo(() => ({
    vendorId: vendorId || '',
    page,
    limit,
    search,
    status,
    startDate,
    endDate,
  }), [endDate, limit, page, search, startDate, status, vendorId]);

  const queryKey = ['get-vendor-store-withdraw-requests', params] as const;

  const fetchVendorStoreWithdrawRequests = useCallback(async (
    requestParams: GetVendorStoreWithdrawRequestsQueryParams
  ): Promise<GetVendorStoreWithdrawRequestsResponse> => {
    const query = new URLSearchParams();
    query.append('vendorId', requestParams.vendorId);
    query.append('page', String(requestParams.page));
    query.append('limit', String(requestParams.limit));
    if (requestParams.search) query.append('search', requestParams.search);
    if (requestParams.status) query.append('status', requestParams.status);
    if (requestParams.startDate) query.append('startDate', requestParams.startDate);
    if (requestParams.endDate) query.append('endDate', requestParams.endDate);

    const res = await Axios.get<GetVendorStoreWithdrawRequestsResponse>(
      `/apps/deliveries/admin/vendor-store-withdraw-requests/requests?${query.toString()}`,
    );
    return res.data;
  }, []);

  return useQuery<GetVendorStoreWithdrawRequestsResponse, ApiErrorResponse>({
    queryKey,
    queryFn: () => fetchVendorStoreWithdrawRequests(params),
    enabled: Boolean(vendorId),
    retry: false,
    placeholderData: (previous) => previous,
    ...options,
  });
};


/**
 * Hook to reject vendor withdraw request
 * @param options - React Query mutation options
 * @returns Mutation result for rejecting vendor withdraw request
 */
export const useRejectVendorWithdraw = (
  options?: UseMutationOptions<
    RejectVendorWithdrawResponse,
    ApiErrorResponse,
    RejectVendorWithdrawPayload
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    RejectVendorWithdrawResponse,
    ApiErrorResponse,
    RejectVendorWithdrawPayload
  >({
    mutationFn: async (payload) => {
      const { id, reason } = payload;

      const { data } = await Axios.patch<RejectVendorWithdrawResponse>(
        `/apps/deliveries/withdraws/${id}/reject`,
        reason ? { reason } : {}
      );

      return data;
    },

    onSuccess: () => {
      // Invalidate withdraw list so UI refreshes
      queryClient.invalidateQueries({ queryKey: ['get-vendor-store-withdraw-requests'] });
    },

    ...options,
  });
};

/**
 * Hook to approve vendor withdraw request
 * @param options - React Query mutation options
 * @returns Mutation result for approving vendor withdraw request
 */
export const useApproveVendorWithdraw = (
  options?: UseMutationOptions<
    ApproveVendorWithdrawResponse,
    ApiErrorResponse,
    ApproveVendorWithdrawPayload
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApproveVendorWithdrawResponse,
    ApiErrorResponse,
    ApproveVendorWithdrawPayload
  >({
    mutationFn: async (payload) => {
      const { id, approved_amount, file, notes } = payload;

      const formData = new FormData();
      formData.append('approved_amount', approved_amount.toString());
      formData.append('file', file);
      if (notes) formData.append('notes', notes);

      const { data } = await Axios.patch<ApproveVendorWithdrawResponse>(
        `/apps/deliveries/withdraws/${id}/approve`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return data;
    },

    onSuccess: () => {
      // Invalidate withdraw list so UI updates
      queryClient.invalidateQueries({ queryKey: ['get-vendor-store-withdraw-requests'] });
    },

    ...options,
  });
};
export const useGetVendorAllStoresWithdrawRequests = (
  options?: Omit<
    UseQueryOptions<GetVendorWithdrawRequestStoresResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const { vendorId } = useParams() as { vendorId?: string };
  const isEnabled = Boolean(vendorId) && (options?.enabled ?? true);

  const queryParams: GetVendorWithdrawRequestStoresQueryParams = {
    vendorId: vendorId || '',
  };

  const storesQueryKey = ['get-vendor-all-stores-withdraw-requests', queryParams] as const;

  return useQuery<GetVendorWithdrawRequestStoresResponse, ApiErrorResponse>({
    ...options,
    queryKey: storesQueryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('vendorId', queryParams.vendorId);

      const res = await Axios.get<VendorWithdrawRequestStoresApiResponse>(
        `/apps/deliveries/admin/vendor-store-withdraw-requests/stores?${searchParams.toString()}`,
      );

      if (Array.isArray(res.data)) {
        return { data: res.data };
      }

      return res.data;
    },
    enabled: isEnabled,
    retry: false,
  });
};

export const useGetVendorStoreBankDetails = (
  storeUserId?: string,
  options?: Omit<
    UseQueryOptions<GetVendorStoreBankDetailsResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const { vendorId } = useParams() as { vendorId?: string };
  const isEnabled =
    Boolean(vendorId) && Boolean(storeUserId) && (options?.enabled ?? true);

  const queryParams: GetVendorStoreBankDetailsQueryParams = {
    vendorId: vendorId || '',
    storeUserId: storeUserId || '',
  };

  const bankDetailsQueryKey = [
    'get-vendor-store-bank-details',
    queryParams,
  ] as const;

  return useQuery<GetVendorStoreBankDetailsResponse, ApiErrorResponse>({
    ...options,
    queryKey: bankDetailsQueryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('vendorId', queryParams.vendorId);
      searchParams.append('store_user_id', queryParams.storeUserId);

      const res = await Axios.get<VendorStoreBankDetailsApiResponse>(
        `/apps/deliveries/admin/vendor-store-withdraw-requests/store-bank-details?${searchParams.toString()}`,
      );

      if (Array.isArray(res.data)) {
        return { data: res.data };
      }

      return res.data;
    },
    enabled: isEnabled,
    retry: false,
  });
};

export const useCreateVendorStoreWithdrawRequest = (
  options?: UseMutationOptions<
    CreateVendorStoreWithdrawRequestResponse,
    ApiErrorResponse,
    CreateVendorStoreWithdrawRequestBody
  >,
) => {
  const queryClient = useQueryClient();
  const { vendorId } = useParams() as { vendorId?: string };

  return useMutation<
    CreateVendorStoreWithdrawRequestResponse,
    ApiErrorResponse,
    CreateVendorStoreWithdrawRequestBody
  >({
    ...options,
    mutationFn: async (payload) => {
      const query = new URLSearchParams();
      query.append('vendorId', vendorId || '');

      const res = await Axios.post<CreateVendorStoreWithdrawRequestResponse>(
        `/apps/deliveries/admin/vendor-store-withdraw-requests?${query.toString()}`,
        payload,
      );
      return res.data;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['get-vendor-store-withdraw-requests'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};
