import type {
  ApiErrorResponse,
  CreateDealPayload,
  CreateDealResponse,
  DeleteDealResponse,
  GetDealDropdownProductsResponse,
  GetDealDropdownVariationsResponse,
  GetDealsQueryParams,
  GetDealsResponse,
  RawDeal,
  UpdateDealPayload,
  UpdateDealResponse,
} from '@/types';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';

type ToggleDealStatusContext = {
  previousDealQueries: Array<
    readonly [readonly unknown[], GetDealsResponse | undefined]
  >;
};

type VendorDealDropdownProductsQueryParams = {
  vendorId: string;
  limit: number;
  offset: number;
  search?: string;
};

type VendorDealDropdownVariationsQueryParams = {
  vendorId: string;
  limit: number;
  offset: number;
  search?: string;
  productId: string;
};

export const useGetDeals = (
  vendorId: string,
  options?: Omit<
    UseQueryOptions<
      GetDealsResponse,
      ApiErrorResponse,
      GetDealsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { enabled, ...restOptions } = options ?? {};
  const { getParam } = useQueryParams();

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;
  const discountTypeParam = getParam('discountType');
  const discountType =
    discountTypeParam === 'percentage' || discountTypeParam === 'fixed'
      ? discountTypeParam
      : undefined;

  const params: GetDealsQueryParams = {
    page,
    limit,
    search,
    discountType,
  };

  return useQuery<GetDealsResponse, ApiErrorResponse>({
    queryKey: ['vendor-product-deals', vendorId, params],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append('page', String(params.page));
      query.append('limit', String(params.limit));

      if (params.search) {
        query.append('search', params.search);
      }
      if (params.discountType) {
        query.append('discountType', params.discountType);
      }

      const { data } = await Axios.get<GetDealsResponse>(
        `/apps/deliveries/vendor/deals/vendor/${vendorId}?${query.toString()}`,
      );

      return data;
    },
    enabled: !!vendorId && (enabled ?? true),
    retry: false,
    ...restOptions,
  });
};

export const useGetDealDropdownProducts = (
  params: VendorDealDropdownProductsQueryParams | null,
  options?: Omit<
    UseQueryOptions<
      GetDealDropdownProductsResponse,
      ApiErrorResponse,
      GetDealDropdownProductsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery<GetDealDropdownProductsResponse, ApiErrorResponse>({
    queryKey: ['vendor-deal-dropdown-products', params],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append(
        'page',
        String(Math.floor(params!.offset / params!.limit) + 1),
      );
      query.append('limit', String(params!.limit));
      query.append('offset', String(params!.offset));

      if (params!.search) {
        query.append('search', params!.search);
      }

      const { data } = await Axios.get<GetDealDropdownProductsResponse>(
        `/apps/deliveries/vendor/deals/dropdown/products/vendor/${params!.vendorId}?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params && (enabled ?? true),
    retry: false,
    ...restOptions,
  });
};

export const useGetDealDropdownVariations = (
  params: VendorDealDropdownVariationsQueryParams | null,
  options?: Omit<
    UseQueryOptions<
      GetDealDropdownVariationsResponse,
      ApiErrorResponse,
      GetDealDropdownVariationsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery<GetDealDropdownVariationsResponse, ApiErrorResponse>({
    queryKey: ['vendor-deal-dropdown-variations', params],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append(
        'page',
        String(Math.floor(params!.offset / params!.limit) + 1),
      );
      query.append('limit', String(params!.limit));
      query.append('offset', String(params!.offset));
      query.append('productId', params!.productId);

      if (params!.search) {
        query.append('search', params!.search);
      }

      const { data } = await Axios.get<GetDealDropdownVariationsResponse>(
        `/apps/deliveries/vendor/deals/dropdown/variations/vendor/${params!.vendorId}?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params && (enabled ?? true),
    retry: false,
    ...restOptions,
  });
};

export const useCreateDeal = (
  vendorId: string,
  options?: UseMutationOptions<CreateDealResponse, ApiErrorResponse, CreateDealPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation<CreateDealResponse, ApiErrorResponse, CreateDealPayload>({
    ...options,
    mutationFn: async (payload) => {
      const { data } = await Axios.post<CreateDealResponse>(
        `/apps/deliveries/store/deals/${vendorId}`,
        payload,
      );

      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-deals', vendorId],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useDeleteDeal = (
  vendorId: string,
  options?: UseMutationOptions<DeleteDealResponse, ApiErrorResponse, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteDealResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (dealId) => {
      const { data } = await Axios.delete<DeleteDealResponse>(
        `/apps/deliveries/store/deals/${vendorId}/${dealId}`,
      );
      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-deals', vendorId],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useUpdateDeal = (
  vendorId: string,
  options?: UseMutationOptions<UpdateDealResponse, ApiErrorResponse, UpdateDealPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation<UpdateDealResponse, ApiErrorResponse, UpdateDealPayload>({
    ...options,
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await Axios.patch<UpdateDealResponse>(
        `/apps/deliveries/store/deals/${vendorId}/${id}`,
        payload,
      );
      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-deals', vendorId],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useToggleDealStatus = (
  vendorId: string,
  options?: UseMutationOptions<
    UpdateDealResponse,
    ApiErrorResponse,
    { id: string; isActive: boolean },
    ToggleDealStatusContext
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateDealResponse,
    ApiErrorResponse,
    { id: string; isActive: boolean },
    ToggleDealStatusContext
  >({
    ...options,
    mutationFn: async ({ id, isActive }) => {
      const { data } = await Axios.patch<UpdateDealResponse>(
        `/apps/deliveries/store/deals/${vendorId}/${id}`,
        { isActive },
      );

      return data;
    },
    retry: false,
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({
        queryKey: ['vendor-product-deals', vendorId],
        exact: false,
      });

      const previousDealQueries = queryClient.getQueriesData<GetDealsResponse>({
        queryKey: ['vendor-product-deals', vendorId],
      });

      previousDealQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<GetDealsResponse>(queryKey, (current) =>
          current
            ? {
                ...current,
                data: current.data.map((deal: RawDeal) =>
                  deal.id === id
                    ? {
                        ...deal,
                        isActive,
                      }
                    : deal,
                ),
              }
            : current,
        );
      });

      return { previousDealQueries };
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      onMutateResult?.previousDealQueries.forEach(([queryKey, previousData]) => {
        queryClient.setQueryData(queryKey, previousData);
      });

      options?.onError?.(error, variables, onMutateResult, context);
    },
    onSettled: (data, error, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-deals', vendorId],
        exact: false,
        refetchType: 'active',
      });

      options?.onSettled?.(data, error, variables, onMutateResult, context);
    },
  });
};

