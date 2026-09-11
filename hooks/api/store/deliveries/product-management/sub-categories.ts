import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  CreateSubCategoryPayload,
  CreateSubCategoryResponse,
  DeleteSubCategoryResponse,
  GetSubCategoriesQueryParams,
  GetSubCategoriesResponse,
  GetSubCategoryParentOptionsQueryParams,
  GetSubCategoryParentOptionsResponse,
  ToggleSubCategoryResponse,
  UpdateSubCategoryPayload,
  UpdateSubCategoryResponse,
} from '@/types';
import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useParams } from 'next/navigation';

type ToggleSubCategoryStatusContext = {
  previousSubCategoryQueries: Array<
    readonly [readonly unknown[], GetSubCategoriesResponse | undefined]
  >;
};

export const useGetSubCategories = (
  options?: Omit<
    UseQueryOptions<
      GetSubCategoriesResponse,
      ApiErrorResponse,
      GetSubCategoriesResponse,
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

  const params: GetSubCategoriesQueryParams | null = storeId
    ? {
        page,
        limit,
        search,
        storeId,
      }
    : null;

  return useQuery<GetSubCategoriesResponse, ApiErrorResponse>({
    queryKey: ['store-product-sub-categories', params],
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

      const { data } = await Axios.get<GetSubCategoriesResponse>(
        `/apps/deliveries/categories/sub-categories?${query.toString()}`,
      );

      return data;
    },
    enabled: !!storeId,
    retry: false,
    ...options,
  });
};

export const useCreateSubCategory = (
  options?: UseMutationOptions<
    CreateSubCategoryResponse,
    ApiErrorResponse,
    CreateSubCategoryPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateSubCategoryResponse,
    ApiErrorResponse,
    CreateSubCategoryPayload
  >({
    ...options,
    mutationFn: async ({ name, categoryId, storeId, image }) => {
      const formData = new FormData();
      formData.append('categoryName', name);
      formData.append('storeId', storeId);

      if (image instanceof File) {
        formData.append('file', image);
      }

      const { data } = await Axios.post<CreateSubCategoryResponse>(
        `/apps/deliveries/categories/create/subcategory/${categoryId}`,
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
        queryKey: ['store-product-sub-categories'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useUpdateSubCategory = (
  options?: UseMutationOptions<
    UpdateSubCategoryResponse,
    ApiErrorResponse,
    UpdateSubCategoryPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateSubCategoryResponse,
    ApiErrorResponse,
    UpdateSubCategoryPayload
  >({
    ...options,
    mutationFn: async ({ id, name, categoryId, image }) => {
      const formData = new FormData();
      formData.append('categoryName', name);
      formData.append('parentId', categoryId);

      if (image instanceof File) {
        formData.append('image', image);
      }

      const { data } = await Axios.patch<UpdateSubCategoryResponse>(
        `/apps/deliveries/categories/update/subcategory/${id}`,
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
        queryKey: ['store-product-sub-categories'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useToggleSubCategoryStatus = (
  options?: UseMutationOptions<
    ToggleSubCategoryResponse,
    ApiErrorResponse,
    string,
    ToggleSubCategoryStatusContext
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ToggleSubCategoryResponse,
    ApiErrorResponse,
    string,
    ToggleSubCategoryStatusContext
  >({
    ...options,
    mutationFn: async (subCategoryId) => {
      const { data } = await Axios.patch<ToggleSubCategoryResponse>(
        `/apps/deliveries/categories/toggle/${subCategoryId}`,
      );

      return data;
    },
    retry: false,
    onMutate: async (subCategoryId) => {
      await queryClient.cancelQueries({
        queryKey: ['store-product-sub-categories'],
        exact: false,
      });

      const previousSubCategoryQueries =
        queryClient.getQueriesData<GetSubCategoriesResponse>({
          queryKey: ['store-product-sub-categories'],
        });

      previousSubCategoryQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<GetSubCategoriesResponse>(queryKey, (current) =>
          current
            ? {
                ...current,
                subCategories: current.subCategories.map((subCategory) =>
                  subCategory.id === subCategoryId
                    ? {
                        ...subCategory,
                        is_active: !subCategory.is_active,
                      }
                    : subCategory,
                ),
              }
            : current,
        );
      });

      return { previousSubCategoryQueries };
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      onMutateResult?.previousSubCategoryQueries.forEach(
        ([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        },
      );

      options?.onError?.(error, variables, onMutateResult, context);
    },
    onSettled: (data, error, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['store-product-sub-categories'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSettled?.(data, error, variables, onMutateResult, context);
    },
  });
};

export const useDeleteSubCategory = (
  options?: UseMutationOptions<DeleteSubCategoryResponse, ApiErrorResponse, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteSubCategoryResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (id) => {
      const { data } = await Axios.delete<DeleteSubCategoryResponse>(
        `/apps/deliveries/categories/delete/${id}`,
      );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['store-product-sub-categories'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useGetSubCategoryParentOptions = (
  params: GetSubCategoryParentOptionsQueryParams | null,
  options?: Omit<
    UseQueryOptions<
      GetSubCategoryParentOptionsResponse,
      ApiErrorResponse,
      GetSubCategoryParentOptionsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<GetSubCategoryParentOptionsResponse, ApiErrorResponse>({
    queryKey: ['store-product-sub-category-parent-options', params],
    queryFn: async () => {
      if (!params) {
        throw new Error('Store ID is required');
      }

      const query = new URLSearchParams();
      query.append('offset', String(params.offset));
      query.append('size', String(params.size));
      query.append('storeId', params.storeId);

      if (params.search) {
        query.append('search', params.search);
      }

      const { data } = await Axios.get<GetSubCategoryParentOptionsResponse>(
        `/apps/deliveries/categories/category-with-offset?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params?.storeId,
    retry: false,
    ...options,
  });
