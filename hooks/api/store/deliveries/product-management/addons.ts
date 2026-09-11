import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  CreateAddonPayload,
  CreateAddonRequest,
  CreateAddonResponse,
  DeleteAddonResponse,
  GetAddonsQueryParams,
  GetAddonsDropdownParams,
  GetAddonsDropdownResponse,
  GetAddonsResponse,
  UpdateAddonPayload,
  UpdateAddonResponse,
} from '@/types';
import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export const useGetAddons = (
  options?: Omit<
    UseQueryOptions<
      GetAddonsResponse,
      ApiErrorResponse,
      GetAddonsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();
  const { storeId } = useParams() as { storeId?: string };

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;

  const params: GetAddonsQueryParams | null = storeId
    ? {
        store_id: storeId,
        page,
        limit,
        search,
      }
    : null;

  return useQuery<GetAddonsResponse, ApiErrorResponse>({
    queryKey: ['store-product-addons', params],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append('store_id', params!.store_id);
      query.append('page', String(params!.page));
      query.append('limit', String(params!.limit));

      if (params!.search) {
        query.append('search', params!.search);
      }

      const { data } = await Axios.get<GetAddonsResponse>(
        `/apps/deliveries/products/customization-groups/add-on?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params,
    retry: false,
    ...options,
  });
};

export const useGetAddonsDropdown = (
  params: GetAddonsDropdownParams | null,
  options?: Omit<
    UseQueryOptions<
      GetAddonsDropdownResponse,
      ApiErrorResponse,
      GetAddonsDropdownResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<GetAddonsDropdownResponse, ApiErrorResponse>({
    queryKey: ['store-product-addons-dropdown', params],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append('store_id', params!.store_id);
      query.append('offset', String(params!.offset));
      query.append('size', String(params!.size));
      if (params!.search) {
        query.append('search', params!.search);
      }

      const { data } = await Axios.get<GetAddonsDropdownResponse>(
        `/apps/deliveries/products/customization-groups/add-on?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params,
    retry: false,
    ...options,
  });
};

export const useCreateAddon = (
  options?: UseMutationOptions<
    CreateAddonResponse,
    ApiErrorResponse,
    CreateAddonPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<CreateAddonResponse, ApiErrorResponse, CreateAddonPayload>({
    ...options,
    mutationFn: async (payload) => {
      const body: CreateAddonRequest = {
        groups: [payload],
      };

      const { data } = await Axios.post<CreateAddonResponse>(
        '/apps/deliveries/products/customization-groups',
        body,
      );

      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['store-product-addons'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useUpdateAddon = (
  options?: UseMutationOptions<
    UpdateAddonResponse,
    ApiErrorResponse,
    UpdateAddonPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<UpdateAddonResponse, ApiErrorResponse, UpdateAddonPayload>({
    ...options,
    mutationFn: async ({ id, optionIds, ...payload }) => {
      const formData = new FormData();

      formData.append('store_id', payload.store_id);
      formData.append('name', payload.name);
      formData.append('description', payload.description);
      formData.append('requiredCheck', String(payload.requiredCheck));
      formData.append('selectionType', payload.selectionType);
      formData.append('type', payload.type);

      optionIds.forEach((optionId) => {
        formData.append('optionIds', optionId);
      });

      const { data } = await Axios.put<UpdateAddonResponse>(
        `/apps/deliveries/products/customization-groups/${id}`,
        formData,
      );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['store-product-addons'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDeleteAddon = (
  options?: UseMutationOptions<DeleteAddonResponse, ApiErrorResponse, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteAddonResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (addonId) => {
      const { data } = await Axios.delete<DeleteAddonResponse>(
        `/apps/deliveries/products/customization-groups/${addonId}`,
      );

      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['store-product-addons'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};
