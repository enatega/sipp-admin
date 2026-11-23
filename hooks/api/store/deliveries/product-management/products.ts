import type { NutritionFact } from '@/lib/nutrition-facts';
import type { VariationAllergen } from '@/lib/allergens';
import { useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ApiErrorResponse,
  BulkUploadProductsPayload,
  BulkUploadProductsResponse,
  BulkUploadProductsStatusResponse,
  CreateProductCustomizationGroupPayload,
  CreateProductCustomizationGroupResponse,
  CreateProductResponse,
  CreateStoreProductPayload,
  DeleteProductCustomizationGroupPayload,
  DeleteProductCustomizationGroupResponse,
  DeleteProductResponse,
  GetProductResponse,
  GetProductsResponse,
  GetProductSubCategoryOptionsParams,
  GetProductSubCategoryOptionsResponse,
  ProductSkuAvailabilityParams,
  ProductSkuAvailabilityResponse,
  ProductSkuSuggestionParams,
  ProductSkuSuggestionResponse,
  ProductStockFilter,
  ToggleProductInStockResponse,
  ToggleProductPublishedResponse,
  TranslateProductTitleResponse,
  UpdateProductCustomizationGroupPayload,
  UpdateProductCustomizationGroupResponse,
  UpdateProductPayload,
  UpdateProductResponse,
  UpdateProductVariationSettingsPayload,
  UpdateProductVariationSettingsResponse,
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

const appendTranslations = (
  formData: FormData,
  key: string,
  translations: Record<string, string> | undefined,
) => {
  if (translations) formData.append(key, JSON.stringify(translations));
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
  nameTranslations?: Record<string, string>;
  description?: string;
  descriptionTranslations?: Record<string, string>;
  requiredCheck?: boolean;
  selectionType?: 'single' | 'multi';
  price?: number;
  minSelect?: number;
  maxSelect?: number;
  sku?: string;
  type: 'variation' | 'add-on';
  optionIds?: string[];
  variation_image?: File;
  /** Sent as JSON; an empty list clears the variation's facts. */
  nutritionFacts?: NutritionFact[];
  /** Sent as JSON; an empty list clears the variation's allergens. */
  allergens?: VariationAllergen[];
  /** New variation only. `null` = unlimited stock. */
  stockQuantity?: number | null;
  inStock?: boolean;
  addOnIds?: string[];
};

const buildAddonGroupFormData = (payload: CustomizationGroupFormPayload) => {
  if (!payload.optionIds?.length) {
    throw new Error('At least one option is required');
  }

  const formData = new FormData();
  formData.append('store_id', payload.store_id);
  formData.append('name', payload.name);
  appendTranslations(formData, 'nameTranslations', payload.nameTranslations);
  formData.append('description', payload.description ?? '');
  appendTranslations(
    formData,
    'descriptionTranslations',
    payload.descriptionTranslations,
  );
  formData.append('requiredCheck', String(payload.requiredCheck ?? false));
  formData.append('selectionType', payload.selectionType ?? 'multi');
  formData.append('type', 'add-on');
  appendIfPresent(formData, 'minSelect', payload.minSelect);
  appendIfPresent(formData, 'maxSelect', payload.maxSelect);

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
  appendTranslations(formData, 'nameTranslations', payload.nameTranslations);
  formData.append('type', 'variation');
  appendIfPresent(formData, 'price', payload.price);
  if (payload.nutritionFacts !== undefined) {
    formData.append('nutritionFacts', JSON.stringify(payload.nutritionFacts));
  }
  if (payload.allergens !== undefined) {
    formData.append('allergens', JSON.stringify(payload.allergens));
  }
  // Sent even when blank so an edit can clear the SKU.
  if (payload.sku !== undefined) formData.append('sku', payload.sku);

  if (payload.variation_image instanceof File) {
    formData.append('variation_image', payload.variation_image);
  }

  // A blank stock quantity means unlimited.
  if (payload.stockQuantity !== undefined) {
    formData.append('stockQuantity', String(payload.stockQuantity ?? ''));
  }
  if (payload.inStock !== undefined) {
    formData.append('inStock', String(payload.inStock));
  }
  if (payload.addOnIds !== undefined) {
    formData.append('addOnIds', JSON.stringify(payload.addOnIds));
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

export const useBulkUploadProductsStatus = (jobId?: string) =>
  useQuery<BulkUploadProductsStatusResponse, ApiErrorResponse>({
    queryKey: ['bulk-product-upload-status', jobId],
    queryFn: async () => {
      const { data } = await Axios.get<BulkUploadProductsStatusResponse>(
        `/apps/deliveries/products/bulk-upload/status/${jobId}`,
      );

      return data;
    },
    enabled: Boolean(jobId),
    retry: false,
    refetchInterval: (query) => {
      if (query.state.status === 'error') return false;
      const status = query.state.data?.status;
      return status === 'completed' || status === 'failed' ? false : 1_500;
    },
  });

export const useCreateProduct = (
  options?: UseMutationOptions<
    CreateProductResponse,
    ApiErrorResponse,
    CreateStoreProductPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateProductResponse,
    ApiErrorResponse,
    CreateStoreProductPayload
  >({
    ...options,
    mutationFn: async (payload) => {
      const formData = new FormData();

      const primaryImage = payload.image instanceof File
        ? payload.image
        : payload.images?.find((image) => image instanceof File);

      if (!(primaryImage instanceof File)) {
        throw new Error('A product image is required');
      }
      formData.append('image', primaryImage);
      if (payload.store_id) {
        formData.append('store_id', payload.store_id);
      }
      formData.append('category_id', payload.category_id);
      formData.append('name', payload.name);
      if (payload.sku) formData.append('sku', payload.sku);
      if (payload.nameTranslations) {
        formData.append(
          'nameTranslations',
          JSON.stringify(payload.nameTranslations),
        );
      }
      formData.append('favouriteFoodIds', JSON.stringify(payload.favouriteFoodIds ?? []));
      formData.append('price', String(payload.variations[0].price));
      if (payload.taxRateId) formData.append('taxRateId', payload.taxRateId);
      // Left out when stock is set on each variation instead.
      if (payload.stock_quantity !== undefined) {
        formData.append('stock_quantity', String(payload.stock_quantity));
      }
      (payload.menu_ids ?? []).forEach((menuId) => {
        formData.append('menu_ids', menuId);
      });

      if (payload.subcategory_id) {
        formData.append('subcategory_id', payload.subcategory_id);
      }

      if (payload.description) {
        formData.append('description', payload.description);
        appendTranslations(
          formData,
          'descriptionTranslations',
          payload.descriptionTranslations,
        );
      }

      if (payload.unit_of_measure) {
        formData.append('unit_of_measure', payload.unit_of_measure);
      }

      (payload.addOns ?? []).forEach((addOnId) => {
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
            ...(variation.nameTranslations
              ? { nameTranslations: variation.nameTranslations }
              : {}),
            price: variation.price,
            ...(variation.sku ? { sku: variation.sku } : {}),
            // `null` is kept: it tells the API the stock is unlimited.
            ...(variation.stockQuantity !== undefined
              ? { stockQuantity: variation.stockQuantity }
              : {}),
            ...(variation.inStock !== undefined
              ? { inStock: variation.inStock }
              : {}),
            ...(variation.addOnIds ? { addOnIds: variation.addOnIds } : {}),
            ...(variation.nutritionFacts?.length
              ? { nutritionFacts: variation.nutritionFacts }
              : {}),
            ...(variation.allergens?.length
              ? { allergens: variation.allergens }
              : {}),
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

export const useTranslateProductTitle = () =>
  useMutation<TranslateProductTitleResponse, ApiErrorResponse, string>({
    mutationFn: async (title) => {
      const { data } = await Axios.post<TranslateProductTitleResponse>(
        '/apps/deliveries/products/translate-title',
        { title },
      );
      return data;
    },
    retry: false,
  });

/** Translates category, description, add-on and option text into active languages. */
export const useTranslateCatalogText = () =>
  useMutation<
    TranslateProductTitleResponse,
    ApiErrorResponse,
    { text: string; textType?: 'plain' | 'html' }
  >({
    mutationFn: async (payload) => {
      const { data } = await Axios.post<TranslateProductTitleResponse>(
        '/apps/deliveries/products/translate-text',
        payload,
      );
      return data;
    },
    retry: false,
  });

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
      if (payload.sku) formData.append('sku', payload.sku);
      if (payload.nameTranslations) {
        formData.append(
          'nameTranslations',
          JSON.stringify(payload.nameTranslations),
        );
      }
      if (payload.favouriteFoodIds !== undefined) {
        formData.append('favouriteFoodIds', JSON.stringify(payload.favouriteFoodIds));
      }
      if (payload.price !== undefined) {
        formData.append('price', String(payload.price));
      }
      if (payload.taxRateId) formData.append('taxRateId', payload.taxRateId);
      if (payload.useDefaultTax) formData.append('useDefaultTax', 'true');
      // Left out for a product with variations; the API ignores it there.
      if (payload.stock_quantity !== undefined) {
        formData.append('stock_quantity', String(payload.stock_quantity));
      }

      if (payload.subcategory_id !== undefined) {
        formData.append('subcategory_id', payload.subcategory_id);
      }

      if (payload.description) {
        formData.append('description', payload.description);
        appendTranslations(
          formData,
          'descriptionTranslations',
          payload.descriptionTranslations,
        );
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

export const useToggleProductPublished = (
  options?: UseMutationOptions<
    ToggleProductPublishedResponse,
    ApiErrorResponse,
    string
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<ToggleProductPublishedResponse, ApiErrorResponse, string>({
    ...options,
    mutationFn: async (id) => {
      const { data } = await Axios.patch<ToggleProductPublishedResponse>(
        `/apps/deliveries/products/${id}/toggle-published`,
      );
      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      const [result, id] = args;
      queryClient.setQueriesData<GetProductsResponse>(
        { queryKey: ['store-products'], exact: false },
        (cached) => cached?.data
          ? {
              ...cached,
              data: cached.data.map((product) =>
                product.id === id
                  ? { ...product, isPublished: result.isPublished }
                  : product,
              ),
            }
          : cached,
      );
      options?.onSuccess?.(...args);
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

export const useUpdateProductVariationOptionPrice = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { productId: string; optionId: string; price: number },
    ApiErrorResponse,
    { productId: string; groupId: string; optionId: string; price: number }
  >({
    mutationFn: async ({ productId, groupId, optionId, price }) => {
      const { data } = await Axios.patch(
        `/apps/deliveries/products/${productId}/variations/${groupId}/options/${optionId}/price`,
        { price },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store-product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
    },
    retry: false,
  });
};

/** Saves the SKU, stock, in-stock switch and add-on groups of one variation. */
export const useUpdateProductVariationSettings = (
  options?: UseMutationOptions<
    UpdateProductVariationSettingsResponse,
    ApiErrorResponse,
    UpdateProductVariationSettingsPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProductVariationSettingsResponse,
    ApiErrorResponse,
    UpdateProductVariationSettingsPayload
  >({
    ...options,
    mutationFn: async ({ productId, variationId, ...settings }) => {
      const { data } = await Axios.patch<UpdateProductVariationSettingsResponse>(
        `/apps/deliveries/products/${productId}/variations/${variationId}/settings`,
        settings,
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

/** Checks whether a product or variation SKU is still free in the store. */
export const useCheckProductSkuAvailability = () =>
  useMutation<
    ProductSkuAvailabilityResponse,
    ApiErrorResponse,
    ProductSkuAvailabilityParams
  >({
    mutationFn: async (params) => {
      const { data } = await Axios.get<ProductSkuAvailabilityResponse>(
        '/apps/deliveries/products/sku-availability',
        { params },
      );
      return data;
    },
    retry: false,
  });

/**
 * Asks for the next free product SKU of a store. Every call reserves a
 * number, so this is a mutation: call it once per opened form, never refetch.
 */
export const useSuggestProductSku = () =>
  useMutation<
    ProductSkuSuggestionResponse,
    ApiErrorResponse,
    ProductSkuSuggestionParams
  >({
    mutationFn: async (params) => {
      const { data } = await Axios.get<ProductSkuSuggestionResponse>(
        '/apps/deliveries/products/sku-suggestion',
        { params },
      );
      return data;
    },
    retry: false,
  });

/** Links an existing add-on group to one product without creating a copy. */
export const useAttachProductCustomizationGroup = (
  options?: UseMutationOptions<
    unknown,
    ApiErrorResponse,
    { id: string; productId: string }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiErrorResponse, { id: string; productId: string }>({
    ...options,
    mutationFn: async ({ id, productId }) => {
      const { data } = await Axios.post(
        `/apps/deliveries/products/${productId}/customization-groups/${id}`,
      );
      return data;
    },
    retry: false,
    // Wait for the product refetch so the picker's pending state ends only
    // once the add-ons list shows the change.
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['store-products'],
          exact: false,
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: ['store-product', variables.productId],
          exact: true,
        }),
      ]);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

/** Unlinks an add-on/variation group from one product; the group itself is kept. */
export const useDetachProductCustomizationGroup = (
  options?: UseMutationOptions<
    unknown,
    ApiErrorResponse,
    { id: string; productId: string }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiErrorResponse, { id: string; productId: string }>({
    ...options,
    mutationFn: async ({ id, productId }) => {
      const { data } = await Axios.delete(
        `/apps/deliveries/products/${productId}/customization-groups/${id}`,
      );
      return data;
    },
    retry: false,
    // Wait for the product refetch so the picker's pending state ends only
    // once the add-ons list shows the change.
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['store-products'],
          exact: false,
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: ['store-product', variables.productId],
          exact: true,
        }),
      ]);
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
