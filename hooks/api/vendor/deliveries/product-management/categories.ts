import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  CreateCategoryPayload,
  CreateCategoryResponse,
  DeleteCategoryResponse,
  GetCategoriesResponse,
  ToggleCategoryResponse,
  UpdateCategoryPayload,
  UpdateCategoryResponse,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useParams } from 'next/navigation';

type ToggleCategoryStatusContext = {
  previousCategoryQueries: Array<
    readonly [readonly unknown[], GetCategoriesResponse | undefined]
  >;
};

const withScopeQuery = (
  url: string,
  scope: { vendorId?: string; storeId?: string },
) => {
  const params = new URLSearchParams();
  if (scope.vendorId) params.append('vendorId', scope.vendorId);
  if (scope.storeId) params.append('storeId', scope.storeId);

  const query = params.toString();
  if (!query) return url;

  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}${query}`;
};

const withVendorIdQuery = (url: string, vendorId?: string) => {
  if (!vendorId) return url;

  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}vendorId=${encodeURIComponent(vendorId)}`;
};

const resolveParamValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export const useGetCategories = (
  options?: Omit<
    UseQueryOptions<
      GetCategoriesResponse,
      ApiErrorResponse,
      GetCategoriesResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const paramsFromRoute = useParams() as { vendorId?: string | string[] };
  const vendorId = resolveParamValue(paramsFromRoute.vendorId);
  const { getParam } = useQueryParams();
  const storeIdFromQuery = getParam('storeId') || undefined;

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;

  const params = vendorId
    ? {
        page,
        limit,
        search,
        vendorId,
        storeId: storeIdFromQuery || vendorId,
      }
    : null;

  return useQuery<GetCategoriesResponse, ApiErrorResponse>({
    queryKey: ['vendor-product-categories', params],
    queryFn: async () => {
      if (!params) {
        throw new Error('Vendor ID is required');
      }

      const query = new URLSearchParams();
      query.append('page', String(params.page));
      query.append('limit', String(params.limit));
      query.append('vendorId', params.vendorId);
      if (params.storeId) {
        query.append('storeId', params.storeId);
      }

      if (params.search) {
        query.append('search', params.search);
      }

      const { data } = await Axios.get<GetCategoriesResponse>(
        `/apps/deliveries/categories/vendor?${query.toString()}`,
      );

      return data;
    },
    enabled: !!vendorId,
    retry: false,
    ...options,
  });
};

export const useCreateCategory = (
  options?: UseMutationOptions<
    CreateCategoryResponse,
    ApiErrorResponse,
    CreateCategoryPayload
  >,
) => {
  const paramsFromRoute = useParams() as { vendorId?: string | string[] };
  const vendorId = resolveParamValue(paramsFromRoute.vendorId);
  const queryClient = useQueryClient();

  return useMutation<
    CreateCategoryResponse,
    ApiErrorResponse,
    CreateCategoryPayload
  >({
    ...options,
    mutationFn: async ({ name, image }) => {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      const formData = new FormData();
      formData.append('categoryName', name);
      formData.append('image', image);
      formData.append('vendorId', vendorId);

      const { data } = await Axios.post<CreateCategoryResponse>(
        withVendorIdQuery('/apps/deliveries/categories/vendor/create', vendorId),
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
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-categories'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useUpdateCategory = (
  options?: UseMutationOptions<
    UpdateCategoryResponse,
    ApiErrorResponse,
    UpdateCategoryPayload
  >,
) => {
  const paramsFromRoute = useParams() as { vendorId?: string | string[] };
  const vendorId = resolveParamValue(paramsFromRoute.vendorId);
  const { getParam } = useQueryParams();
  const queryClient = useQueryClient();

  return useMutation<
    UpdateCategoryResponse,
    ApiErrorResponse,
    UpdateCategoryPayload
  >({
    ...options,
    mutationFn: async ({ id, name, image }) => {
      const resolvedStoreId = getParam('storeId') || vendorId;

      if (!resolvedStoreId) {
        throw new Error('Store ID is required');
      }

      const formData = new FormData();
      formData.append('categoryName', name);
      formData.append('storeId', resolvedStoreId);
      if (vendorId) {
        formData.append('vendorId', vendorId);
      }

      if (image instanceof File) {
        formData.append('image', image);
      }

      const { data } = await Axios.patch<UpdateCategoryResponse>(
        withScopeQuery(`/apps/deliveries/categories/vendor/update/${id}`, {
          vendorId,
          storeId: resolvedStoreId,
        }),
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
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-categories'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useToggleCategoryStatus = (
  options?: UseMutationOptions<
    ToggleCategoryResponse,
    ApiErrorResponse,
    string,
    ToggleCategoryStatusContext
  >,
) => {
  const paramsFromRoute = useParams() as { vendorId?: string | string[] };
  const vendorId = resolveParamValue(paramsFromRoute.vendorId);
  const { getParam } = useQueryParams();
  const queryClient = useQueryClient();

  return useMutation<
    ToggleCategoryResponse,
    ApiErrorResponse,
    string,
    ToggleCategoryStatusContext
  >({
    ...options,
    mutationFn: async (categoryId) => {
      const resolvedStoreId = getParam('storeId') || vendorId;

      if (!resolvedStoreId) {
        throw new Error('Store ID is required');
      }

      const { data } = await Axios.patch<ToggleCategoryResponse>(
        withScopeQuery(`/apps/deliveries/categories/toggle/${categoryId}`, {
          vendorId,
          storeId: resolvedStoreId,
        }),
      );

      return data;
    },
    retry: false,
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({
        queryKey: ['vendor-product-categories'],
        exact: false,
      });

      const previousCategoryQueries =
        queryClient.getQueriesData<GetCategoriesResponse>({
          queryKey: ['vendor-product-categories'],
        });

      previousCategoryQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<GetCategoriesResponse>(queryKey, (current) => {
          if (!current) return current;

          return {
            ...current,
            categories: current.categories.map((category) =>
              category.id === categoryId
                ? { ...category, is_active: !category.is_active }
                : category,
            ),
          };
        });
      });

      return {
        previousCategoryQueries,
      };
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      onMutateResult?.previousCategoryQueries.forEach(
        ([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        },
      );

      options?.onError?.(error, variables, onMutateResult, context);
    },
    onSettled: (data, error, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-categories'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSettled?.(data, error, variables, onMutateResult, context);
    },
  });
};

export const useDeleteCategory = (
  options?: UseMutationOptions<DeleteCategoryResponse, ApiErrorResponse, string>,
) => {
  const paramsFromRoute = useParams() as { vendorId?: string | string[] };
  const vendorId = resolveParamValue(paramsFromRoute.vendorId);
  const { getParam } = useQueryParams();
  const queryClient = useQueryClient();

  return useMutation<DeleteCategoryResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (id) => {
      const resolvedStoreId = getParam('storeId') || vendorId;

      if (!resolvedStoreId) {
        throw new Error('Store ID is required');
      }

      const { data } = await Axios.delete<DeleteCategoryResponse>(
        withScopeQuery(`/apps/deliveries/categories/vendor/delete/${id}`, {
          vendorId,
          storeId: resolvedStoreId,
        }),
      );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-categories'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
