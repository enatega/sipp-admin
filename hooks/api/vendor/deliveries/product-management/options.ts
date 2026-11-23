import Axios from '@/config/axios';
import { hasAdminProfile } from '@/lib/user';
import { useQueryParams } from '@/hooks/use-query-params';
import { useParams } from 'next/navigation';
import {
  ApiErrorResponse,
  GetOptionsDropdownResponse,
  OptionDropdownItem,
  VendorChainOption,
  VendorChainOptionCreatePayload,
  VendorChainOptionDeleteResponse,
  VendorChainOptionDropdownParams,
  VendorChainOptionListParams,
  VendorChainOptionListResponse,
  VendorChainOptionUpdatePayload,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

const normalizeOption = (option: VendorChainOption): VendorChainOption => ({
  ...option,
  title: option.name,
});

const normalizeDropdownOption = (option: {
  id: string;
  name?: string;
  title?: string;
}): OptionDropdownItem => ({
  id: option.id,
  title: option.title ?? option.name ?? '',
});

const buildQuery = (params: {
  vendorId?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const query = new URLSearchParams();

  if (params.vendorId) {
    query.append('vendorId', params.vendorId);
  }

  if (typeof params.page === 'number') {
    query.append('page', String(params.page));
  }

  if (typeof params.limit === 'number') {
    query.append('limit', String(params.limit));
  }

  if (params.search) {
    query.append('search', params.search);
  }

  return query;
};

const resolveVendorId = (routeVendorId?: string) =>
  hasAdminProfile() ? routeVendorId : undefined;

const buildUrlWithQuery = (path: string, query: URLSearchParams) => {
  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
};

export const useGetOptions = (
  options?: Omit<
    UseQueryOptions<
      VendorChainOptionListResponse,
      ApiErrorResponse,
      VendorChainOptionListResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();
  const { vendorId: routeVendorId } = useParams() as { vendorId?: string };

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;
  const vendorId = resolveVendorId(routeVendorId);

  const params: VendorChainOptionListParams | null =
    hasAdminProfile() && !vendorId
      ? null
      : vendorId
        ? {
            vendorId,
            page,
            limit,
            search,
          }
        : {
            page,
            limit,
            search,
          };

  return useQuery<VendorChainOptionListResponse, ApiErrorResponse>({
    queryKey: ['vendor-chain-options', params],
    queryFn: async () => {
      const query = buildQuery(params!);
      const { data } = await Axios.get<VendorChainOptionListResponse>(
        buildUrlWithQuery('/apps/deliveries/chain-options/options', query),
      );

      return {
        ...data,
        data: data.data.map(normalizeOption),
      };
    },
    enabled: !!params,
    retry: false,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

export const useGetOptionsDropdown = (
  params: VendorChainOptionDropdownParams | null,
  options?: Omit<
    UseQueryOptions<
      GetOptionsDropdownResponse,
      ApiErrorResponse,
      GetOptionsDropdownResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { vendorId, store_id, page, limit, search } = params ?? {};
  const resolvedVendorId = vendorId ?? store_id;

  const queryParams = resolvedVendorId
    ? {
        vendorId: resolvedVendorId,
        page: page ?? 1,
        limit: limit ?? 10,
        search,
      }
    : null;

  return useQuery<GetOptionsDropdownResponse, ApiErrorResponse>({
    queryKey: ['vendor-chain-options-dropdown', queryParams],
    queryFn: async () => {
      const query = buildQuery({
        vendorId: queryParams?.vendorId,
        page: queryParams?.page,
        limit: queryParams?.limit,
        search: queryParams?.search,
      });

      const { data } = await Axios.get<GetOptionsDropdownResponse>(
        buildUrlWithQuery(
          '/apps/deliveries/chain-options/options/dropdown',
          query,
        ),
      );

      return {
        ...data,
        data: data.data.map(normalizeDropdownOption),
      };
    },
    enabled: !!queryParams,
    retry: false,
    ...options,
  });
};

export const useCreateOption = (
  options?: UseMutationOptions<
    VendorChainOption,
    ApiErrorResponse,
    VendorChainOptionCreatePayload
  >,
) => {
  const queryClient = useQueryClient();
  const { vendorId: routeVendorId } = useParams() as { vendorId?: string };
  const vendorId = resolveVendorId(routeVendorId);

  return useMutation<VendorChainOption, ApiErrorResponse, VendorChainOptionCreatePayload>({
    ...options,
    mutationFn: async (payload) => {
      if (hasAdminProfile() && !vendorId) {
        throw new Error('Vendor ID is required');
      }

      const body = {
        vendorId,
        name: payload.title,
        description: payload.description,
        price: payload.price,
        unitOfMeasure: payload.unitOfMeasure,
        stockQuantity: payload.stockQuantity,
        isActive: payload.isActive ?? true,
      };

      const { data } = await Axios.post<VendorChainOption>(
        '/apps/deliveries/chain-options/options',
        body,
      );

      return normalizeOption(data);
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-chain-options'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useUpdateOption = (
  options?: UseMutationOptions<
    VendorChainOption,
    ApiErrorResponse,
    VendorChainOptionUpdatePayload
  >,
) => {
  const queryClient = useQueryClient();
  const { vendorId: routeVendorId } = useParams() as { vendorId?: string };
  const vendorId = resolveVendorId(routeVendorId);

  return useMutation<VendorChainOption, ApiErrorResponse, VendorChainOptionUpdatePayload>({
    ...options,
    mutationFn: async ({ id, ...payload }) => {
      if (hasAdminProfile() && !vendorId) {
        throw new Error('Vendor ID is required');
      }

      const query = buildQuery({ vendorId });
      const { data } = await Axios.patch<VendorChainOption>(
        buildUrlWithQuery(
          `/apps/deliveries/chain-options/options/${id}`,
          query,
        ),
        {
          name: payload.title,
          description: payload.description,
          price: payload.price,
          unitOfMeasure: payload.unitOfMeasure,
          stockQuantity: payload.stockQuantity,
          isActive: payload.isActive,
        },
      );

      return normalizeOption(data);
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-chain-options'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['vendor-chain-option', variables.id],
        exact: true,
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDeleteOption = (
  options?: UseMutationOptions<
    VendorChainOptionDeleteResponse,
    ApiErrorResponse,
    string
  >,
) => {
  const queryClient = useQueryClient();
  const { vendorId: routeVendorId } = useParams() as { vendorId?: string };
  const vendorId = resolveVendorId(routeVendorId);

  return useMutation<VendorChainOptionDeleteResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (optionId) => {
      if (hasAdminProfile() && !vendorId) {
        throw new Error('Vendor ID is required');
      }

      const query = buildQuery({ vendorId });
      const { data } = await Axios.delete<VendorChainOptionDeleteResponse>(
        buildUrlWithQuery(
          `/apps/deliveries/chain-options/options/${optionId}`,
          query,
        ),
      );

      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-chain-options'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};
