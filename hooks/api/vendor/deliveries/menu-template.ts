import { useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ApiErrorResponse,
  CreateVendorChainMenuApiResponse,
  CreateVendorChainMenuPayload,
  GetVendorChainMenusResponse,
  GetVendorChainMenuStoresQueryParams,
  GetVendorChainMenuStoresResponse,
  MessageResponse,
  UpdateVendorChainMenuPayload,
  VendorChainMenu,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import type { GetVendorChainMenusQueryParams } from '@/types/api/vendor/deliveries/menu-template.api';
import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';

type ToggleVendorChainMenuActiveContext = {
  previousMenusQueries: Array<
    readonly [readonly unknown[], GetVendorChainMenusResponse | undefined]
  >;
};

export const useGetVendorChainMenus = (
  options?: Omit<
    UseQueryOptions<
      GetVendorChainMenusResponse,
      ApiErrorResponse,
      GetVendorChainMenusResponse,
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
  const filter = getParam('tabStatus');
  const isActiveParam = getParam('isActive');

  const params: GetVendorChainMenusQueryParams = useMemo(
    () => ({
      page,
      limit,
      search,
      filter: filter && filter !== 'all' ? filter : undefined,
      isActive:
        isActiveParam === 'true'
          ? true
          : isActiveParam === 'false'
            ? false
            : undefined,
      vendorId,
    }),
    [filter, isActiveParam, limit, page, search, vendorId],
  );

  const fetchVendorChainMenus = useCallback(
    async (
      requestParams: GetVendorChainMenusQueryParams,
    ): Promise<GetVendorChainMenusResponse> => {
      const query = new URLSearchParams();

      if (requestParams.page !== undefined) {
        query.append('page', String(requestParams.page));
      }
      if (requestParams.offset !== undefined) {
        query.append('offset', String(requestParams.offset));
      }
      if (requestParams.limit !== undefined) {
        query.append('limit', String(requestParams.limit));
      }
      if (requestParams.search) {
        query.append('search', requestParams.search);
      }
      if (requestParams.filter) {
        query.append('filter', requestParams.filter);
      }
      if (requestParams.isActive !== undefined) {
        query.append('isActive', String(requestParams.isActive));
      }
      if (requestParams.vendorId) {
        query.append('vendorId', requestParams.vendorId);
      }

      const { data } = await Axios.get<GetVendorChainMenusResponse>(
        `/apps/deliveries/chain-menus?${query.toString()}`,
      );

      return data;
    },
    [],
  );

  return useQuery<GetVendorChainMenusResponse, ApiErrorResponse>({
    queryKey: ['vendor-delivery-chain-menus', params],
    queryFn: () => fetchVendorChainMenus(params),
    enabled: !!vendorId,
    retry: false,
    placeholderData: (previous) => previous,
    ...options,
  });
};

export const useGetVendorChainMenuById = (
  menuId: string,
  options?: Omit<
    UseQueryOptions<VendorChainMenu | null, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { vendorId } = useParams() as { vendorId?: string };

  const getCachedMenu = useCallback(() => {
    const cachedQueries =
      queryClient.getQueriesData<GetVendorChainMenusResponse>({
        queryKey: ['vendor-delivery-chain-menus'],
      });

    for (const [, response] of cachedQueries) {
      const matchedMenu = response?.data.find((menu) => menu.id === menuId);
      if (matchedMenu) return matchedMenu;
    }

    return null;
  }, [menuId, queryClient]);

  return useQuery<VendorChainMenu | null, ApiErrorResponse>({
    queryKey: ['vendor-delivery-chain-menu-detail', menuId, vendorId],
    queryFn: async () => {
      const cachedMenu = getCachedMenu();
      if (cachedMenu) return cachedMenu;

      const query = new URLSearchParams();
      query.append('page', '1');
      query.append('limit', '100');
      if (vendorId) {
        query.append('vendorId', vendorId);
      }

      const { data } = await Axios.get<GetVendorChainMenusResponse>(
        `/apps/deliveries/chain-menus?${query.toString()}`,
      );

      return data.data.find((menu) => menu.id === menuId) || null;
    },
    enabled: !!menuId && !!vendorId,
    initialData: getCachedMenu,
    retry: false,
    ...options,
  });
};

export const useGetVendorChainMenuStores = (
  options?: Omit<
    UseQueryOptions<
      GetVendorChainMenuStoresResponse,
      ApiErrorResponse,
      GetVendorChainMenuStoresResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { vendorId } = useParams() as { vendorId?: string };
  const { getParam } = useQueryParams();

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;

  const params: GetVendorChainMenuStoresQueryParams = useMemo(
    () => ({
      page,
      limit,
      vendorId,
    }),
    [limit, page, vendorId],
  );

  const fetchVendorChainMenuStores = useCallback(
    async (
      requestParams: GetVendorChainMenuStoresQueryParams,
    ): Promise<GetVendorChainMenuStoresResponse> => {
      const query = new URLSearchParams();

      if (requestParams.page !== undefined) {
        query.append('page', String(requestParams.page));
      }
      if (requestParams.offset !== undefined) {
        query.append('offset', String(requestParams.offset));
      }
      if (requestParams.limit !== undefined) {
        query.append('limit', String(requestParams.limit));
      }
      if (requestParams.vendorId) {
        query.append('vendorId', requestParams.vendorId);
      }

      const { data } = await Axios.get<GetVendorChainMenuStoresResponse>(
        `/apps/deliveries/chain-menus/vendor/stores?${query.toString()}`,
      );

      return data;
    },
    [],
  );

  return useQuery<GetVendorChainMenuStoresResponse, ApiErrorResponse>({
    queryKey: ['vendor-delivery-chain-menu-stores', params],
    queryFn: () => fetchVendorChainMenuStores(params),
    enabled: !!vendorId,
    retry: false,
    placeholderData: (previous) => previous,
    ...options,
  });
};

export const useCreateVendorChainMenu = (
  options?: UseMutationOptions<
    CreateVendorChainMenuApiResponse,
    ApiErrorResponse,
    CreateVendorChainMenuPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateVendorChainMenuApiResponse,
    ApiErrorResponse,
    CreateVendorChainMenuPayload
  >({
    ...options,
    mutationFn: async (payload: CreateVendorChainMenuPayload) => {
      const formData = new FormData();

      formData.append('name', payload.name);
      formData.append('description', payload.description);
      formData.append('vendorId', payload.vendorId);

      if (payload.image) {
        formData.append('image', payload.image);
      }

      if (payload.isActive !== undefined) {
        formData.append('isActive', String(payload.isActive));
      }

      payload.storeIds.forEach((storeId) => {
        formData.append('storeIds', storeId);
      });

      const { data } = await Axios.post<CreateVendorChainMenuApiResponse>(
        `/apps/deliveries/chain-menus`,
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
      void queryClient.invalidateQueries({
        queryKey: ['vendor-delivery-chain-menus'],
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

export const useDeleteVendorChainMenu = (
  options?: UseMutationOptions<MessageResponse, ApiErrorResponse, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation<MessageResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (menuId: string) => {
      const { data } = await Axios.delete<MessageResponse>(
        `/apps/deliveries/chain-menus/${menuId}`,
      );
      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: ['vendor-delivery-chain-menus'],
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

export const useUpdateVendorChainMenu = (
  options?: UseMutationOptions<
    VendorChainMenu,
    ApiErrorResponse,
    UpdateVendorChainMenuPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    VendorChainMenu,
    ApiErrorResponse,
    UpdateVendorChainMenuPayload
  >({
    ...options,
    mutationFn: async (payload: UpdateVendorChainMenuPayload) => {
      const formData = new FormData();

      if (payload.name) {
        formData.append('name', payload.name);
      }
      if (payload.description) {
        formData.append('description', payload.description);
      }
      if (payload.image) {
        formData.append('image', payload.image);
      }
      if (payload.isActive !== undefined) {
        formData.append('isActive', String(payload.isActive));
      }
      if (payload.vendorId) {
        formData.append('vendorId', payload.vendorId);
      }
      payload.storeIds.forEach((storeId) => {
        formData.append('storeIds', storeId);
      });

      const { data } = await Axios.patch<VendorChainMenu>(
        `/apps/deliveries/chain-menus/${payload.menuId}`,
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
      void queryClient.invalidateQueries({
        queryKey: ['vendor-delivery-chain-menus'],
        exact: false,
        refetchType: 'active',
      });
      void queryClient.invalidateQueries({
        queryKey: ['vendor-delivery-chain-menu-detail'],
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

export const useToggleVendorChainMenuActive = (
  options?: UseMutationOptions<
    { isActive: boolean; message: string },
    ApiErrorResponse,
    string,
    ToggleVendorChainMenuActiveContext
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { isActive: boolean; message: string },
    ApiErrorResponse,
    string,
    ToggleVendorChainMenuActiveContext
  >({
    ...options,
    mutationFn: async (menuId: string) => {
      const { data } = await Axios.patch<{
        isActive: boolean;
        message: string;
      }>(`/apps/deliveries/chain-menus/${menuId}/toggle-active`);
      return data;
    },
    retry: false,
    onMutate: async (menuId) => {
      await queryClient.cancelQueries({
        queryKey: ['vendor-delivery-chain-menus'],
        exact: false,
      });

      const previousMenusQueries =
        queryClient.getQueriesData<GetVendorChainMenusResponse>({
          queryKey: ['vendor-delivery-chain-menus'],
        });

      previousMenusQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<GetVendorChainMenusResponse>(
          queryKey,
          (current) => {
            if (!current) return current;

            return {
              ...current,
              data: current.data.map((menu) =>
                menu.id === menuId
                  ? {
                      ...menu,
                      isActive: !menu.isActive,
                    }
                  : menu,
              ),
            };
          },
        );
      });

      return {
        previousMenusQueries,
      };
    },
    onSuccess: (...args) => {
      options?.onSuccess?.(...args);
    },
    onError: (error, menuId, context, ...rest) => {
      context?.previousMenusQueries.forEach(([queryKey, previousData]) => {
        queryClient.setQueryData(queryKey, previousData);
      });

      options?.onError?.(error, menuId, context, ...rest);
    },
    onSettled: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: ['vendor-delivery-chain-menus'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSettled?.(...args);
    },
  });
};
