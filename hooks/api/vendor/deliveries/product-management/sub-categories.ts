import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  CreateSubCategoryPayload,
  CreateSubCategoryResponse,
  DeleteSubCategoryResponse,
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

type VendorCreateSubCategoryPayload = Omit<CreateSubCategoryPayload, 'storeId'>;

const withVendorIdQuery = (url: string, vendorId?: string) => {
  if (!vendorId) return url;

  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}vendorId=${encodeURIComponent(vendorId)}`;
};

const resolveParamValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

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
  const paramsFromRoute = useParams() as { vendorId?: string | string[] };
  const vendorId = resolveParamValue(paramsFromRoute.vendorId);
  const { getParam } = useQueryParams();

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;

  const params = vendorId
    ? {
      page,
      limit,
      search,
      vendorId,
    }
    : null;

  return useQuery<GetSubCategoriesResponse, ApiErrorResponse>({
    queryKey: ['vendor-product-sub-categories', params],
    queryFn: async () => {
      if (!params) {
        throw new Error('Vendor ID is required');
      }

      const query = new URLSearchParams();
      query.append('page', String(params.page));
      query.append('limit', String(params.limit));
      query.append('vendorId', params.vendorId);

      if (params.search) {
        query.append('search', params.search);
      }

      const { data } = await Axios.get<GetSubCategoriesResponse>(
        `/apps/deliveries/categories/vendor/sub-categories?${query.toString()}`,
      );

      return data;
    },
    enabled: !!vendorId,
    retry: false,
    ...options,
  });
};

export const useCreateSubCategory = (
  options?: UseMutationOptions<
    CreateSubCategoryResponse,
    ApiErrorResponse,
    VendorCreateSubCategoryPayload
  >,
) => {
  const paramsFromRoute = useParams() as { vendorId?: string | string[] };
  const vendorId = resolveParamValue(paramsFromRoute.vendorId);
  const queryClient = useQueryClient();

  return useMutation<
    CreateSubCategoryResponse,
    ApiErrorResponse,
    VendorCreateSubCategoryPayload
  >({
    ...options,
    mutationFn: async ({ name, categoryId, image }) => {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      const formData = new FormData();
      formData.append('subCategoryName', name);
      formData.append('categoryName', name);
      formData.append('vendorId', vendorId);

      if (image instanceof File) {
        formData.append('image', image);
      }

      const { data } = await Axios.post<CreateSubCategoryResponse>(
        withVendorIdQuery(
          `/apps/deliveries/categories/vendor/subcategory/create/${categoryId}`,
          vendorId,
        ),
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
        queryKey: ['vendor-product-sub-categories'],
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
  const paramsFromRoute = useParams() as { vendorId?: string | string[] };
  const vendorId = resolveParamValue(paramsFromRoute.vendorId);
  const queryClient = useQueryClient();

  return useMutation<
    UpdateSubCategoryResponse,
    ApiErrorResponse,
    UpdateSubCategoryPayload
  >({
    ...options,
    mutationFn: async ({ id, name, categoryId, image }) => {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      const formData = new FormData();
      formData.append('subCategoryName', name);
      formData.append('categoryName', name);
      formData.append('parentId', categoryId);
      formData.append('vendorId', vendorId);

      if (image instanceof File) {
        formData.append('image', image);
      }

      const { data } = await Axios.patch<UpdateSubCategoryResponse>(
        withVendorIdQuery(
          `/apps/deliveries/categories/vendor/subcategory/update/${id}`,
          vendorId,
        ),
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
        queryKey: ['vendor-product-sub-categories'],
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
  const paramsFromRoute = useParams() as { vendorId?: string | string[] };
  const vendorId = resolveParamValue(paramsFromRoute.vendorId);
  const queryClient = useQueryClient();

  return useMutation<
    ToggleSubCategoryResponse,
    ApiErrorResponse,
    string,
    ToggleSubCategoryStatusContext
  >({
    ...options,
    mutationFn: async (subCategoryId) => {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      const { data } = await Axios.patch<ToggleSubCategoryResponse>(
        withVendorIdQuery(
          `/apps/deliveries/categories/toggle/${subCategoryId}`,
          vendorId,
        ),
      );

      return data;
    },
    retry: false,
    onMutate: async (subCategoryId) => {
      await queryClient.cancelQueries({
        queryKey: ['vendor-product-sub-categories'],
        exact: false,
      });

      const previousSubCategoryQueries =
        queryClient.getQueriesData<GetSubCategoriesResponse>({
          queryKey: ['vendor-product-sub-categories'],
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
        queryKey: ['vendor-product-sub-categories'],
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
  const paramsFromRoute = useParams() as { vendorId?: string | string[] };
  const vendorId = resolveParamValue(paramsFromRoute.vendorId);
  const queryClient = useQueryClient();

  return useMutation<DeleteSubCategoryResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (id) => {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      const { data } = await Axios.delete<DeleteSubCategoryResponse>(
        withVendorIdQuery(`/apps/deliveries/categories/vendor/subcategory/delete/${id}`, vendorId),
      );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-product-sub-categories'],
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
) => {
  const paramsFromRoute = useParams() as { vendorId?: string | string[] };
  const vendorId = resolveParamValue(paramsFromRoute.vendorId);

  return (
    useQuery<GetSubCategoryParentOptionsResponse, ApiErrorResponse>({
      queryKey: ['vendor-product-sub-category-parent-options', params, vendorId],
      queryFn: async () => {
        if (!params) {
          throw new Error('Query params are required');
        }

        if (!vendorId) {
          throw new Error('Vendor ID is required');
        }

        const query = new URLSearchParams();
        query.append('offset', String(params.offset));
        query.append('size', String(params.size));
        query.append('vendorId', vendorId);

        if (params.search) {
          query.append('search', params.search);
        }

        const { data } = await Axios.get<GetSubCategoryParentOptionsResponse>(
          `/apps/deliveries/categories/vendor/dropdown?${query.toString()}`,
        );

        return data;
      },
      enabled: !!params && !!vendorId,
      retry: false,
      ...options,
    })
  );
};


