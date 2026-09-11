import type {
  ActiveDealOption,
  ApiErrorResponse,
  CreateDealPayload,
  CreateDealResponse,
  DeleteDealResponse,
  GetActiveDealsQueryParams,
  GetActiveDealsResponse,
  GetDealDropdownProductsQueryParams,
  GetDealDropdownProductsResponse,
  GetDealDropdownVariationsQueryParams,
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

export const useGetDeals = (
  storeId: string,
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
    queryKey: ['store-product-deals', storeId, params],
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
        `/apps/deliveries/store/deals/${storeId}?${query.toString()}`,
      );

      return data;
    },
    enabled: !!storeId && (enabled ?? true),
    retry: false,
    ...restOptions,
  });
};

export const useGetActiveDeals = (
  params: GetActiveDealsQueryParams | null,
  options?: Omit<
    UseQueryOptions<
      GetActiveDealsResponse,
      ApiErrorResponse,
      GetActiveDealsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery<GetActiveDealsResponse, ApiErrorResponse>({
    queryKey: ['store-active-deals', params],
    queryFn: async () => {
      const query = new URLSearchParams();
      const offset = params?.offset ?? 0;
      const limit = params?.limit ?? 100;

      query.append('store_id', params!.store_id);
      query.append('offset', String(offset));
      query.append('limit', String(limit));
      if (params!.search) {
        query.append('search', params!.search);
      }

      const { data } = await Axios.get<
        | ActiveDealOption[]
        | {
            data?: ActiveDealOption[];
            total?: number;
            offset?: number;
            limit?: number;
            hasMore?: boolean;
          }
      >(`/apps/deliveries/store/deals/active-deals?${query.toString()}`);

      const normalizedData = Array.isArray(data) ? data : (data.data ?? []);
      const mappedData = normalizedData.map((deal) => ({
        id: deal.id,
        deal_name:
          deal.deal_name ??
          (deal as { dealName?: string }).dealName ??
          deal.id,
        discountType:
          (deal as { discountType?: string }).discountType ??
          (deal as { discount_type?: string }).discount_type,
        discountValue:
          (deal as { discountValue?: number | string | null }).discountValue ??
          (deal as { discount_value?: number | string | null }).discount_value,
        discount_type: (deal as { discount_type?: string }).discount_type,
        discount_value:
          (deal as { discount_value?: number | string | null }).discount_value,
      }));
      const total = Array.isArray(data) ? normalizedData.length : (data.total ?? normalizedData.length);
      const normalizedOffset = Array.isArray(data) ? offset : (data.offset ?? offset);
      const normalizedLimit = Array.isArray(data) ? limit : (data.limit ?? limit);
      const hasMore =
        Array.isArray(data)
          ? false
          : (data.hasMore ?? normalizedOffset + normalizedData.length < total);

      return {
        data: mappedData,
        total,
        offset: normalizedOffset,
        limit: normalizedLimit,
        hasMore,
      };
    },
    enabled: !!params?.store_id && (enabled ?? true),
    retry: false,
    ...restOptions,
  });
};

export const useGetDealDropdownProducts = (
  params: GetDealDropdownProductsQueryParams | null,
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
    queryKey: ['store-deal-dropdown-products', params],
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
        `/apps/deliveries/store/deals/${params!.storeId}/dropdown/products?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params && (enabled ?? true),
    retry: false,
    ...restOptions,
  });
};

export const useGetDealDropdownVariations = (
  params: GetDealDropdownVariationsQueryParams | null,
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
    queryKey: ['store-deal-dropdown-variations', params],
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
        `/apps/deliveries/store/deals/${params!.storeId}/dropdown/variations?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params && (enabled ?? true),
    retry: false,
    ...restOptions,
  });
};

export const useCreateDeal = (
  storeId: string,
  options?: UseMutationOptions<CreateDealResponse, ApiErrorResponse, CreateDealPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation<CreateDealResponse, ApiErrorResponse, CreateDealPayload>({
    ...options,
    mutationFn: async (payload) => {
      const { data } = await Axios.post<CreateDealResponse>(
        `/apps/deliveries/store/deals/${storeId}`,
        payload,
      );

      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['store-product-deals', storeId],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['store-active-deals'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useDeleteDeal = (
  storeId: string,
  options?: UseMutationOptions<DeleteDealResponse, ApiErrorResponse, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteDealResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (dealId) => {
      const { data } = await Axios.delete<DeleteDealResponse>(
        `/apps/deliveries/store/deals/${storeId}/${dealId}`,
      );
      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['store-product-deals', storeId],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useUpdateDeal = (
  storeId: string,
  options?: UseMutationOptions<UpdateDealResponse, ApiErrorResponse, UpdateDealPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation<UpdateDealResponse, ApiErrorResponse, UpdateDealPayload>({
    ...options,
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await Axios.patch<UpdateDealResponse>(
        `/apps/deliveries/store/deals/${storeId}/${id}`,
        payload,
      );
      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['store-product-deals', storeId],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useToggleDealStatus = (
  storeId: string,
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
        `/apps/deliveries/store/deals/${storeId}/${id}`,
        { isActive },
      );

      return data;
    },
    retry: false,
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({
        queryKey: ['store-product-deals', storeId],
        exact: false,
      });

      const previousDealQueries = queryClient.getQueriesData<GetDealsResponse>({
        queryKey: ['store-product-deals', storeId],
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
        queryKey: ['store-product-deals', storeId],
        exact: false,
        refetchType: 'active',
      });

      options?.onSettled?.(data, error, variables, onMutateResult, context);
    },
  });
};
