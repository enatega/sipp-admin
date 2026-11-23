import Axios from '@/config/axios';
import { hasAdminProfile } from '@/lib/user';
import { useQueryParams } from '@/hooks/use-query-params';
import { useParams } from 'next/navigation';
import {
  ApiErrorResponse,
} from '@/types';
import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type {
  VendorAddon,
  VendorAddonCreatePayload,
  VendorAddonDeleteResponse,
  VendorAddonDetailParams,
  VendorAddonDropdownResponse,
  VendorAddonListParams,
  VendorAddonListResponse,
  VendorAddonMutationResponse,
  VendorAddonUpdatePayload,
} from '@/types/api/vendor/deliveries/addons.api';
import type { Option } from '@/types';

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    query.append(key, String(value));
  });

  return query;
};

const buildUrlWithQuery = (path: string, query: URLSearchParams) => {
  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
};

const resolveVendorId = (routeVendorId?: string) =>
  hasAdminProfile() ? routeVendorId : undefined;

const parseBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'off', ''].includes(normalized)) return false;
  }
  return Boolean(value);
};

const normalizeAddonOption = (option: unknown): Option => {
  const candidate = option as {
    id?: string;
    title?: string;
    name?: string;
    price?: string | number;
    description?: string;
    unitOfMeasure?: string | null;
    stockQuantity?: number;
    createdAt?: string;
    updatedAt?: string;
    isActive?: unknown;
  };

  return {
    id: candidate?.id ?? '',
    title: candidate?.title ?? candidate?.name ?? '',
    price: candidate?.price ?? 0,
    description: candidate?.description ?? '',
    unitOfMeasure: candidate?.unitOfMeasure ?? null,
    stockQuantity: candidate?.stockQuantity ?? 0,
    createdAt: candidate?.createdAt ?? '',
    updatedAt: candidate?.updatedAt ?? '',
    isActive:
      candidate?.isActive === undefined ? undefined : parseBoolean(candidate.isActive),
  };
};

const normalizeAddon = (addon: VendorAddon): VendorAddon => ({
  ...addon,
  options: Array.isArray(addon.options)
    ? addon.options.map((option) => normalizeAddonOption(option))
    : [],
  status: parseBoolean(addon.status),
  requiredCheck: parseBoolean(addon.requiredCheck),
  dependsOnVariationId: addon.dependsOnVariationId ?? null,
});

const extractAddonItems = (payload: unknown): VendorAddon[] => {
  const candidate = payload as {
    data?: unknown;
    groups?: unknown;
    customizationGroups?: unknown;
    items?: unknown;
  };

  const items =
    candidate?.data ?? candidate?.groups ?? candidate?.customizationGroups ?? candidate?.items ?? [];

  return Array.isArray(items)
    ? items.map((item) => normalizeAddon(item as VendorAddon))
    : [];
};

const normalizeListResponse = (
  data: VendorAddonListResponse | unknown,
  fallbackPage: number,
  fallbackLimit: number,
): VendorAddonListResponse => ({
  ...(data as VendorAddonListResponse),
  data: extractAddonItems(data),
  page: (data as VendorAddonListResponse)?.page ?? fallbackPage,
  limit: (data as VendorAddonListResponse)?.limit ?? fallbackLimit,
  total: (data as VendorAddonListResponse)?.total ?? 0,
  totalPages:
    (data as VendorAddonListResponse)?.totalPages ??
    Math.max(
      1,
      Math.ceil(
        ((data as VendorAddonListResponse)?.total ?? 0) /
          Math.max(fallbackLimit, 1),
      ),
    ),
  hasNext: (data as VendorAddonListResponse)?.hasNext ?? false,
  hasPrevious: (data as VendorAddonListResponse)?.hasPrevious ?? false,
  hasMore: (data as VendorAddonListResponse)?.hasMore ?? false,
});

const normalizeSingleAddon = (data: unknown): VendorAddon => {
  const candidate = data as {
    data?: unknown;
    group?: unknown;
    customizationGroup?: unknown;
  };

  const addon =
    candidate?.data ??
    candidate?.group ??
    candidate?.customizationGroup ??
    data;

  return normalizeAddon(addon as VendorAddon);
};

export const useGetAddons = (
  options?: Omit<
    UseQueryOptions<
      VendorAddonListResponse,
      ApiErrorResponse,
      VendorAddonListResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { enabled: queryEnabled, ...queryOptions } = options ?? {};
  const { getParam } = useQueryParams();
  const { vendorId: routeVendorId } = useParams() as { vendorId?: string };

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;
  const vendorId = resolveVendorId(routeVendorId);

  const params: VendorAddonListParams | null =
    hasAdminProfile() && !vendorId
      ? null
      : vendorId
        ? {
            vendor_id: vendorId,
            page,
            limit,
            search,
          }
        : {
            page,
            limit,
            search,
          };

  return useQuery<VendorAddonListResponse, ApiErrorResponse>({
    queryKey: ['vendor-product-addons', params],
    queryFn: async () => {
      const query = buildQuery({
        vendor_id: params?.vendor_id,
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
      });

      const { data } = await Axios.get<unknown>(
        buildUrlWithQuery(
          '/apps/deliveries/chain-customization-groups',
          query,
        ),
      );

      return normalizeListResponse(data, page, limit);
    },
    enabled: !!params && (queryEnabled ?? true),
    retry: false,
    placeholderData: (previousData) => previousData,
    ...queryOptions,
  });
};

export const useGetAddonById = (
  params: VendorAddonDetailParams | null,
  options?: Omit<
    UseQueryOptions<VendorAddon, ApiErrorResponse, VendorAddon, readonly unknown[]>,
    'queryKey' | 'queryFn'
  >,
) => {
  const { enabled: queryEnabled, ...queryOptions } = options ?? {};

  return useQuery<VendorAddon, ApiErrorResponse>({
    queryKey: ['vendor-product-addon', params],
    queryFn: async () => {
      if (!params?.id) {
        throw new Error('Addon ID is required');
      }

      if (hasAdminProfile() && !params.vendor_id) {
        throw new Error('Vendor ID is required');
      }

      const query = buildQuery({
        vendor_id: params?.vendor_id,
      });

      const { data } = await Axios.get<unknown>(
        buildUrlWithQuery(
          `/apps/deliveries/chain-customization-groups/${params.id}`,
          query,
        ),
      );

      return normalizeSingleAddon(data);
    },
    enabled:
      !!params?.id &&
      (!hasAdminProfile() || !!params?.vendor_id) &&
      (queryEnabled ?? true),
    retry: false,
    placeholderData: (previousData) => previousData,
    ...queryOptions,
  });
};

export const useGetAddonsDropdown = (
  params: VendorAddonListParams | null,
  options?: Omit<
    UseQueryOptions<
      VendorAddonDropdownResponse,
      ApiErrorResponse,
      VendorAddonDropdownResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { enabled: queryEnabled, ...queryOptions } = options ?? {};

  return useQuery<VendorAddonDropdownResponse, ApiErrorResponse>({
    queryKey: ['vendor-product-addons-dropdown', params],
    queryFn: async () => {
      const query = buildQuery({
        vendor_id: params?.vendor_id,
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
      });

      const { data } = await Axios.get<unknown>(
        buildUrlWithQuery('/apps/deliveries/chain-customization-groups', query),
      );

      return normalizeListResponse(
        data,
        params?.page ?? 1,
        params?.limit ?? 10,
      );
    },
    enabled: !!params && (queryEnabled ?? true),
    retry: false,
    ...queryOptions,
  });
};

export const useCreateAddon = (
  options?: UseMutationOptions<
    VendorAddonMutationResponse,
    ApiErrorResponse,
    VendorAddonCreatePayload
  >,
) => {
  const queryClient = useQueryClient();
  const { vendorId: routeVendorId } = useParams() as { vendorId?: string };
  const vendorId = resolveVendorId(routeVendorId);

  return useMutation<VendorAddonMutationResponse, ApiErrorResponse, VendorAddonCreatePayload>({
    ...options,
    mutationFn: async (payload) => {
      if (hasAdminProfile() && !vendorId) {
        throw new Error('Vendor ID is required');
      }

      const body = {
        vendor_id: vendorId ?? payload.vendor_id,
        name: payload.name,
        description: payload.description,
        requiredCheck: payload.requiredCheck,
        selectionType: payload.selectionType,
        price: payload.price,
        minSelect: payload.minSelect,
        maxSelect: payload.maxSelect,
        status: payload.status,
        type: payload.type,
        dependsOnVariationId: payload.dependsOnVariationId,
        optionIds: payload.optionIds,
      };

      const { data } = await Axios.post<VendorAddonMutationResponse>(
        '/apps/deliveries/chain-customization-groups',
        body,
      );

      return normalizeSingleAddon(data);
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-addons'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-addon'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useUpdateAddon = (
  options?: UseMutationOptions<
    VendorAddonMutationResponse,
    ApiErrorResponse,
    VendorAddonUpdatePayload
  >,
) => {
  const queryClient = useQueryClient();
  const { vendorId: routeVendorId } = useParams() as { vendorId?: string };
  const vendorId = resolveVendorId(routeVendorId);

  return useMutation<VendorAddonMutationResponse, ApiErrorResponse, VendorAddonUpdatePayload>({
    ...options,
    mutationFn: async ({ id, vendor_id: payloadVendorId, ...payload }) => {
      if (hasAdminProfile() && !vendorId && !payloadVendorId) {
        throw new Error('Vendor ID is required');
      }

      const query = buildQuery({ vendor_id: vendorId ?? payloadVendorId });
      const { data } = await Axios.patch<VendorAddonMutationResponse>(
        buildUrlWithQuery(
          `/apps/deliveries/chain-customization-groups/${id}`,
          query,
        ),
        {
          name: payload.name,
          description: payload.description,
          requiredCheck: payload.requiredCheck,
          selectionType: payload.selectionType,
          price: payload.price,
          minSelect: payload.minSelect,
          maxSelect: payload.maxSelect,
          status: payload.status,
          type: payload.type,
          dependsOnVariationId: payload.dependsOnVariationId,
          optionIds: payload.optionIds,
        },
      );

      return normalizeSingleAddon(data);
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-addons'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-addon', variables.id],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDeleteAddon = (
  options?: UseMutationOptions<VendorAddonDeleteResponse, ApiErrorResponse, string>,
) => {
  const queryClient = useQueryClient();
  const { vendorId: routeVendorId } = useParams() as { vendorId?: string };
  const vendorId = resolveVendorId(routeVendorId);

  return useMutation<VendorAddonDeleteResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (addonId) => {
      if (hasAdminProfile() && !vendorId) {
        throw new Error('Vendor ID is required');
      }

      const query = buildQuery({ vendor_id: vendorId });
      const { data } = await Axios.delete<VendorAddonDeleteResponse>(
        buildUrlWithQuery(
          `/apps/deliveries/chain-customization-groups/${addonId}`,
          query,
        ),
      );

      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-addons'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-addon'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};
