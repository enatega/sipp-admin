import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  CreateCategoryPayload,
  CreateCategoryResponse,
  DeleteCategoryResponse,
  GetCategoriesQueryParams,
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
  const { storeId } = useParams() as { storeId?: string };
  const { getParam } = useQueryParams();

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;

  const params: GetCategoriesQueryParams | null = storeId
    ? {
        page,
        limit,
        search,
        storeId,
      }
    : null;

  return useQuery<GetCategoriesResponse, ApiErrorResponse>({
    queryKey: ['store-product-categories', params],
    queryFn: async () => {
      if (!params) {
        throw new Error('Store ID is required');
      }

      const query = new URLSearchParams();
      query.append('page', String(params.page));
      query.append('limit', String(params.limit));
      query.append('storeId', params.storeId);

      if (params.search) {
        query.append('search', params.search);
      }

      const { data } = await Axios.get<GetCategoriesResponse>(
        `/apps/deliveries/categories?${query.toString()}`,
      );

      return data;
    },
    enabled: !!storeId,
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
  const queryClient = useQueryClient();

  return useMutation<
    CreateCategoryResponse,
    ApiErrorResponse,
    CreateCategoryPayload
  >({
    ...options,
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append('categoryName', payload.name);
      formData.append('image', payload.image);
      formData.append('storeId', payload.storeId);

      const { data } = await Axios.post<CreateCategoryResponse>(
        '/apps/deliveries/categories/create/store',
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
        queryKey: ['store-product-categories'],
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
  const queryClient = useQueryClient();

  return useMutation<
    UpdateCategoryResponse,
    ApiErrorResponse,
    UpdateCategoryPayload
  >({
    ...options,
    mutationFn: async ({ id, name, image }) => {
      const formData = new FormData();
      formData.append('categoryName', name);

      if (image instanceof File) {
        formData.append('image', image);
      }

      const { data } = await Axios.patch<UpdateCategoryResponse>(
        `/apps/deliveries/categories/update/${id}`,
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
        queryKey: ['store-product-categories'],
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
  const queryClient = useQueryClient();

  return useMutation<
    ToggleCategoryResponse,
    ApiErrorResponse,
    string,
    ToggleCategoryStatusContext
  >({
    ...options,
    mutationFn: async (categoryId) => {
      const { data } = await Axios.patch<ToggleCategoryResponse>(
        `/apps/deliveries/categories/toggle/${categoryId}`,
      );

      return data;
    },
    retry: false,
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({
        queryKey: ['store-product-categories'],
        exact: false,
      });

      const previousCategoryQueries =
        queryClient.getQueriesData<GetCategoriesResponse>({
          queryKey: ['store-product-categories'],
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
        queryKey: ['store-product-categories'],
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
  const queryClient = useQueryClient();

  return useMutation<DeleteCategoryResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (id) => {
      const { data } = await Axios.delete<DeleteCategoryResponse>(
        `/apps/deliveries/categories/delete/${id}`,
      );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['store-product-categories'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
