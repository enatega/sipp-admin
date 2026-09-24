import { useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ApiErrorResponse,
  BulkUploadProductsPayload,
  BulkUploadProductsResponse,
  CreateProductCustomizationGroupPayload,
  CreateProductCustomizationGroupResponse,
  CreateProductPayload,
  CreateProductResponse,
  DeleteProductCustomizationGroupPayload,
  DeleteProductCustomizationGroupResponse,
  DeleteProductResponse,
  GetProductResponse,
  GetProductsResponse,
  GetProductSubCategoryOptionsParams,
  GetProductSubCategoryOptionsResponse,
  ProductStockFilter,
  ToggleProductInStockResponse,
  UpdateProductCustomizationGroupPayload,
  UpdateProductCustomizationGroupResponse,
  UpdateProductPayload,
  UpdateProductResponse,
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

export const resolveStockFilter = (tab?: string): ProductStockFilter => {
  if (tab === 'instock' || tab === 'in_stock') {
    return 'instock';
  }

  if (tab === 'outofstock' || tab === 'out_of_stock') {
    return 'outofstock';
  }

  return 'all';
};

const appendIfPresent = (
  formData: FormData,
  key: string,
  value: string | number | boolean | null | undefined,
) => {
  if (value === null || value === undefined || value === '') return;
  formData.append(key, String(value));
};

type CustomizationGroupFormPayload = {
  store_id: string;
  name: string;
  description?: string;
  requiredCheck?: boolean;
  selectionType?: 'single' | 'multi';
  price?: number;
  type: 'variation' | 'add-on';
  optionIds?: string[];
  variation_image?: File;
};

const buildAddonGroupFormData = (payload: CustomizationGroupFormPayload) => {
  if (!payload.optionIds?.length) {
    throw new Error('At least one option is required');
  }

  const formData = new FormData();
  formData.append('store_id', payload.store_id);
  formData.append('name', payload.name);
  formData.append('description', payload.description ?? '');
  formData.append('requiredCheck', String(payload.requiredCheck ?? false));
  formData.append('selectionType', payload.selectionType ?? 'multi');
  formData.append('type', 'add-on');

  if (payload.optionIds?.length) {
    payload.optionIds.forEach((optionId) => {
      formData.append('optionIds', optionId);
    });
  }

  return formData;
};

const buildVariationGroupFormData = (
  payload: CustomizationGroupFormPayload,
) => {
  const formData = new FormData();
  formData.append('store_id', payload.store_id);
  formData.append('name', payload.name);
  formData.append('type', 'variation');
  appendIfPresent(formData, 'price', payload.price ?? 0);

  if (payload.variation_image instanceof File) {
    formData.append('variation_image', payload.variation_image);
  }

  return formData;
};

export const useGetProducts = (
  options?: Omit<
    UseQueryOptions<
      GetProductsResponse,
      ApiErrorResponse,
      GetProductsResponse,
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
  const stock = resolveStockFilter(getParam('tab') || undefined);

  const params = useMemo(
    () =>
      storeId
        ? {
            store_id: storeId,
            page,
            limit,
            stock,
            search,
          }
        : null,
    [limit, page, search, stock, storeId],
  );

  const fetchProducts = useCallback(
    async (
      requestParams: NonNullable<typeof params>,
    ): Promise<GetProductsResponse> => {
      const query = new URLSearchParams();

      query.append('store_id', requestParams.store_id);
      query.append('page', String(requestParams.page));
      query.append('limit', String(requestParams.limit));
      query.append('stock', requestParams.stock);

      if (requestParams.search) {
        query.append('search', requestParams.search);
      }

      const { data } = await Axios.get<GetProductsResponse>(
        `/apps/deliveries/products?${query.toString()}`,
      );

      return data;
    },
    [],
  );

  return useQuery<GetProductsResponse, ApiErrorResponse>({
    queryKey: ['store-products', params],
    queryFn: () => fetchProducts(params!),
    enabled: !!params,
    retry: false,
    placeholderData: (previous) => previous,
    ...options,
  });
};

export const useBulkUploadProducts = (
  options?: UseMutationOptions<
    BulkUploadProductsResponse,
    ApiErrorResponse,
    BulkUploadProductsPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    BulkUploadProductsResponse,
    ApiErrorResponse,
    BulkUploadProductsPayload
  >({
    ...options,
    mutationFn: async ({
      file,
      store_id,
      importMode = 'create',
      autoCreateMasterData = true,
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('store_id', store_id);
      formData.append('importMode', importMode);
      formData.append('autoCreateMasterData', String(autoCreateMasterData));

      const { data } = await Axios.post<BulkUploadProductsResponse>(
        '/apps/deliveries/products/bulk-upload-with-variations',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['store-products'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useCreateProduct = (
  options?: UseMutationOptions<
    CreateProductResponse,
    ApiErrorResponse,
    CreateProductPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateProductResponse,
    ApiErrorResponse,
    CreateProductPayload
  >({
    ...options,
    mutationFn: async (payload) => {
      const formData = new FormData();

      if (payload.images?.length) {
        payload.images.forEach((image) => {
          formData.append('images', image);
        });
      }
      formData.append('image', payload.images?.[0] ?? payload.image);
      if (payload.store_id) {
        formData.append('store_id', payload.store_id);
      }
      formData.append('category_id', payload.category_id);
      formData.append('name', payload.name);
      formData.append('price', String(payload.price));
      if (payload.taxRateId) formData.append('taxRateId', payload.taxRateId);
      formData.append('stock_quantity', String(payload.stock_quantity));
      (payload.menu_ids ?? []).forEach((menuId) => {
        formData.append('menu_ids', menuId);
      });

      if (payload.subcategory_id) {
        formData.append('subcategory_id', payload.subcategory_id);
      }

      if (payload.description) {
        formData.append('description', payload.description);
      }

      if (payload.unit_of_measure) {
        formData.append('unit_of_measure', payload.unit_of_measure);
      }

      payload.addOns.forEach((addOnId) => {
        formData.append('addOns', addOnId);
      });
      (payload.deal_ids ?? []).forEach((dealId) => {
        formData.append('deal_ids', dealId);
      });

      formData.append(
        'customizationGroups',
        JSON.stringify({
          groups: payload.variations.map((variation) => ({
            name: variation.name,
            price: variation.price,
          })),
        }),
      );

      payload.variations.forEach((variation) => {
        if (variation.image instanceof File) {
          formData.append('variation_image', variation.image);
        }
      });

      const { data } = await Axios.post<CreateProductResponse>(
        '/apps/deliveries/products/create-product-with-customization',
        formData,
      );

      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['store-products'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useGetProduct = (
  id?: string,
  options?: Omit<
    UseQueryOptions<GetProductResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery<GetProductResponse, ApiErrorResponse>({
    queryKey: ['store-product', id],
    queryFn: async () => {
      const { data } = await Axios.get<GetProductResponse>(
        `/apps/deliveries/products/${id}/with-customization`,
      );

      return data;
    },
    enabled: !!id && (enabled ?? true),
    retry: false,
    ...restOptions,
  });
};

export const useUpdateProduct = (
  options?: UseMutationOptions<
    UpdateProductResponse,
    ApiErrorResponse,
    UpdateProductPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProductResponse,
    ApiErrorResponse,
    UpdateProductPayload
  >({
    ...options,
    mutationFn: async ({ id, image, images, prevImages, ...payload }) => {
      const formData = new FormData();

      const normalizedPrevImages = Array.isArray(prevImages)
        ? prevImages.filter((prevImage) => typeof prevImage === 'string')
        : [];

      const normalizedNewImages = Array.isArray(images)
        ? images.filter(
            (galleryImage): galleryImage is File =>
              galleryImage instanceof File,
          )
        : [];

      if (normalizedNewImages.length > 0) {
        normalizedNewImages.forEach((galleryImage) => {
          formData.append('images', galleryImage);
        });
      }

      if (Array.isArray(prevImages)) {
        formData.append('prevImages', JSON.stringify(normalizedPrevImages));
      }

      const fallbackImage = images?.[0] ?? image;
      if (fallbackImage instanceof File) {
        formData.append('image', fallbackImage);
      } else if (typeof fallbackImage === 'string' && fallbackImage.trim()) {
        formData.append('image', fallbackImage);
      }

      formData.append('category_id', payload.category_id);
      formData.append('name', payload.name);
      formData.append('price', String(payload.price));
      if (payload.taxRateId) formData.append('taxRateId', payload.taxRateId);
      if (payload.useDefaultTax) formData.append('useDefaultTax', 'true');
      formData.append('stock_quantity', String(payload.stock_quantity));

      if (payload.subcategory_id) {
        formData.append('subcategory_id', payload.subcategory_id);
      }

      if (payload.description) {
        formData.append('description', payload.description);
      }

      if (payload.unit_of_measure) {
        formData.append('unit_of_measure', payload.unit_of_measure);
      }
      (payload.deal_ids ?? []).forEach((dealId) => {
        formData.append('deal_ids', dealId);
      });

      const { data } = await Axios.patch<UpdateProductResponse>(
        `/apps/deliveries/products/${id}`,
        formData,
      );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['store-products'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['store-product', variables.id],
        exact: true,
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDeleteProduct = (
  options?: UseMutationOptions<DeleteProductResponse, ApiErrorResponse, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteProductResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (id) => {
      const { data } = await Axios.delete<DeleteProductResponse>(
        `/apps/deliveries/products/${id}`,
      );

      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['store-products'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSuccess?.(...args);
    },
  });
};

export const useToggleProductInStock = (
  options?: UseMutationOptions<
    ToggleProductInStockResponse,
    ApiErrorResponse,
    string,
    {
      previousQueries: [readonly unknown[], GetProductsResponse | undefined][];
    }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ToggleProductInStockResponse,
    ApiErrorResponse,
    string,
    {
      previousQueries: [readonly unknown[], GetProductsResponse | undefined][];
    }
  >({
    ...options,
    mutationFn: async (id) => {
      const { data } = await Axios.patch<ToggleProductInStockResponse>(
        `/apps/deliveries/products/${id}/toggle-instock`,
      );

      return data;
    },
    retry: false,
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: ['store-products'],
        exact: false,
      });

      const previousQueries = queryClient.getQueriesData<GetProductsResponse>({
        queryKey: ['store-products'],
        exact: false,
      });

      previousQueries.forEach(([queryKey, cached]) => {
        if (!cached?.data) return;

        queryClient.setQueryData<GetProductsResponse>(queryKey, {
          ...cached,
          data: cached.data.map((product) =>
            product.id === id
              ? { ...product, inStock: !product.inStock }
              : product,
          ),
        });
      });

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      context?.previousQueries?.forEach(([queryKey, cached]) => {
        queryClient.setQueryData(queryKey, cached);
      });
    },
    onSettled: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['store-products'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSettled?.(...args);
    },
  });
};

export const useGetProductSubCategoryOptions = (
  params: GetProductSubCategoryOptionsParams | null,
  options?: Omit<
    UseQueryOptions<
      GetProductSubCategoryOptionsResponse,
      ApiErrorResponse,
      GetProductSubCategoryOptionsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<GetProductSubCategoryOptionsResponse, ApiErrorResponse>({
    queryKey: ['store-product-sub-category-options', params],
    queryFn: async () => {
      const storeId = params?.storeId ?? params?.vendorId;
      if (!storeId) {
        throw new Error('storeId is required');
      }

      const query = new URLSearchParams();
      query.append('storeId', storeId);
      query.append('categoryId', params!.categoryId);
      query.append('offset', String(params!.offset));
      query.append('size', String(params!.size));
      if (params!.search) {
        query.append('search', params!.search);
      }

      const { data } = await Axios.get<GetProductSubCategoryOptionsResponse>(
        `/apps/deliveries/categories/sub-categories/with-offset?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params,
    retry: false,
    ...options,
  });
};

export const useAddProductCustomizationGroup = (
  options?: UseMutationOptions<
    CreateProductCustomizationGroupResponse,
    ApiErrorResponse,
    CreateProductCustomizationGroupPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateProductCustomizationGroupResponse,
    ApiErrorResponse,
    CreateProductCustomizationGroupPayload
  >({
    ...options,
    mutationFn: async (payload) => {
      const formData =
        payload.type === 'add-on'
          ? buildAddonGroupFormData(payload)
          : buildVariationGroupFormData(payload);

      const { data } =
        await Axios.post<CreateProductCustomizationGroupResponse>(
          `/apps/deliveries/products/${payload.productId}/customization-groups`,
          formData,
        );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['store-products'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['store-product', variables.productId],
        exact: true,
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useUpdateProductCustomizationGroup = (
  options?: UseMutationOptions<
    UpdateProductCustomizationGroupResponse,
    ApiErrorResponse,
    UpdateProductCustomizationGroupPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProductCustomizationGroupResponse,
    ApiErrorResponse,
    UpdateProductCustomizationGroupPayload
  >({
    ...options,
    mutationFn: async ({ id, ...payload }) => {
      const formData =
        payload.type === 'add-on'
          ? buildAddonGroupFormData(payload)
          : buildVariationGroupFormData(payload);

      const { data } = await Axios.put<UpdateProductCustomizationGroupResponse>(
        `/apps/deliveries/products/customization-groups/${id}`,
        formData,
      );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['store-products'],
        exact: false,
        refetchType: 'active',
      });
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: ['store-product', variables.productId],
          exact: true,
        });
      }
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDeleteProductCustomizationGroup = (
  options?: UseMutationOptions<
    DeleteProductCustomizationGroupResponse,
    ApiErrorResponse,
    DeleteProductCustomizationGroupPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteProductCustomizationGroupResponse,
    ApiErrorResponse,
    DeleteProductCustomizationGroupPayload
  >({
    ...options,
    mutationFn: async ({ id }) => {
      const { data } =
        await Axios.delete<DeleteProductCustomizationGroupResponse>(
          `/apps/deliveries/products/customization-groups/${id}`,
        );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['store-products'],
        exact: false,
        refetchType: 'active',
      });
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: ['store-product', variables.productId],
          exact: true,
        });
      }
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
