import type { NutritionFact } from '@/lib/nutrition-facts';
import type { VariationAllergen } from '@/lib/allergens';
import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  CreateProductCustomizationGroupPayload,
  CreateProductCustomizationGroupResponse,
  CreateProductResponse,
  CreateVendorProductPayload,
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
import { useParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

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

const buildAddonGroupFormData = (
  payload: CustomizationGroupFormPayload,
) => {
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
  formData.append('type', 'variation');
  appendIfPresent(formData, 'price', payload.price);
  if (payload.nutritionFacts !== undefined) {
    formData.append('nutritionFacts', JSON.stringify(payload.nutritionFacts));
  }
  if (payload.allergens !== undefined) {
    formData.append('allergens', JSON.stringify(payload.allergens));
  }

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
  const { vendorId: storeId } = useParams() as { vendorId?: string };

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;
  const stock = resolveStockFilter(getParam('tab') || undefined);

  const params = useMemo(
    () =>
      storeId
        ? {
          vendorId: storeId,
          page,
          limit,
          stock,
          search,
        }
        : null,
    [limit, page, search, stock, storeId],
  );

  const fetchProducts = useCallback(async (
    requestParams: NonNullable<typeof params>,
  ): Promise<GetProductsResponse> => {
    const query = new URLSearchParams();

    query.append('vendorId', requestParams.vendorId);
    query.append('page', String(requestParams.page));
    query.append('limit', String(requestParams.limit));
    query.append('stock', requestParams.stock);

    if (requestParams.search) {
      query.append('search', requestParams.search);
    }

    const { data } = await Axios.get<GetProductsResponse>(
      `/apps/deliveries/chain-menus/vendor/chain-products?${query.toString()}`,
    );

    return data;
  }, []);

  return useQuery<GetProductsResponse, ApiErrorResponse>({
    queryKey: ['vendor-products', params],
    queryFn: () => fetchProducts(params!),
    enabled: !!params,
    retry: false,
    placeholderData: (previous) => previous,
    ...options,
  });
};

export const useCreateProduct = (
  options?: UseMutationOptions<
    CreateProductResponse,
    ApiErrorResponse,
    CreateVendorProductPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateProductResponse,
    ApiErrorResponse,
    CreateVendorProductPayload
  >({
    ...options,
    mutationFn: async (payload) => {
      const formData = new FormData();

      formData.append('image', payload.image);
      if (payload.store_id) {
        formData.append('store_id', payload.store_id);
      }
      formData.append('category_id', payload.category_id);
      formData.append('name', payload.name);
      if (payload.sku) formData.append('sku', payload.sku);
      formData.append('price', String(payload.variations[0].price));
      payload.menu_ids.forEach((menuId) => {
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

      // Stock and add-ons belong to each variation: this endpoint reads no
      // product-level stock or add-ons. A SKU that is left out is generated.
      formData.append(
        'customizationGroups',
        JSON.stringify({
          groups: payload.variations.map((variation) => ({
            name: variation.name,
            price: variation.price,
            ...(variation.sku ? { sku: variation.sku } : {}),
            // Always sent: `null` tells the API the stock is unlimited.
            stockQuantity: variation.stockQuantity ?? null,
            addOnIds: variation.addOnIds ?? [],
            ...(variation.inStock !== undefined
              ? { inStock: variation.inStock }
              : {}),
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
        '/apps/deliveries/chain-menus/products/create-with-customization',
        formData,
      );

      return data;
    },
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-products'],
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
    queryKey: ['vendor-product', id],
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
    mutationFn: async ({ id, image, ...payload }) => {
      const formData = new FormData();

      if (image instanceof File) {
        formData.append('image', image);
      }

      formData.append('category_id', payload.category_id);
      formData.append('name', payload.name);
      if (payload.price !== undefined) {
        formData.append('price', String(payload.price));
      }
      // Left out for a product with variations; the API ignores it there.
      if (payload.stock_quantity !== undefined) {
        formData.append('stock_quantity', String(payload.stock_quantity));
      }

      if (payload.subcategory_id !== undefined) {
        formData.append('subcategory_id', payload.subcategory_id);
      }

      if (payload.description) {
        formData.append('description', payload.description);
      }

      if (payload.unit_of_measure) {
        formData.append('unit_of_measure', payload.unit_of_measure);
      }

      if (payload.menu_ids?.length) {
        payload.menu_ids.forEach((menuId) => {
          formData.append('menu_ids', menuId);
        });
      }

      const { data } = await Axios.patch<UpdateProductResponse>(
        `/apps/deliveries/products/${id}`,
        formData,
      );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-products'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['vendor-product', variables.id],
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
        queryKey: ['vendor-products'],
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
        queryKey: ['vendor-products'],
        exact: false,
      });

      const previousQueries = queryClient.getQueriesData<GetProductsResponse>({
        queryKey: ['vendor-products'],
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
        queryKey: ['vendor-products'],
        exact: false,
        refetchType: 'active',
      });
      options?.onSettled?.(...args);
    },
  });
};

type VendorSubCategoryOptionsRawResponse =
  | GetProductSubCategoryOptionsResponse
  | {
      data?: unknown;
      subCategories?: unknown;
      total?: number;
      hasMore?: boolean;
      isEnd?: boolean;
    };

const normalizeVendorSubCategoryOptionsResponse = (
  raw: VendorSubCategoryOptionsRawResponse,
  params: GetProductSubCategoryOptionsParams,
): GetProductSubCategoryOptionsResponse => {
  const data = Array.isArray((raw as { data?: unknown[] }).data)
    ? ((raw as { data: GetProductSubCategoryOptionsResponse['data'] }).data ?? [])
    : Array.isArray((raw as { subCategories?: unknown[] }).subCategories)
      ? (
          (raw as {
            subCategories: Array<{ id: string; categoryName?: string; name?: string }>;
          }).subCategories.map((item) => ({
            ...item,
            categoryName: item.categoryName ?? item.name ?? '',
          })) as GetProductSubCategoryOptionsResponse['data']
        )
      : [];

  const hasMore =
    typeof (raw as { hasMore?: boolean }).hasMore === 'boolean'
      ? Boolean((raw as { hasMore?: boolean }).hasMore)
      : typeof (raw as { isEnd?: boolean }).isEnd === 'boolean'
        ? !Boolean((raw as { isEnd?: boolean }).isEnd)
        : data.length >= params.size;

  return {
    data,
    total: typeof raw.total === 'number' ? raw.total : data.length,
    offset: params.offset,
    size: params.size,
    hasMore,
  };
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
    queryKey: ['vendor-product-sub-category-options', params],
    queryFn: async () => {
      const vendorId = params?.vendorId ?? params?.storeId;
      if (!vendorId) {
        throw new Error('vendorId is required');
      }

      const query = new URLSearchParams();
      query.append('vendorId', vendorId);
      query.append('categoryId', params!.categoryId);
      query.append('offset', String(params!.offset));
      query.append('size', String(params!.size));
      if (params!.search) {
        query.append('search', params!.search);
      }

      const { data } = await Axios.get<VendorSubCategoryOptionsRawResponse>(
        `/apps/deliveries/categories/vendor/sub-categories?${query.toString()}`,
      );

      return normalizeVendorSubCategoryOptionsResponse(data, params!);
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

      const { data } = await Axios.post<CreateProductCustomizationGroupResponse>(
        `/apps/deliveries/products/${payload.productId}/customization-groups`,
        formData,
      );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-products'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['vendor-product', variables.productId],
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
        queryKey: ['vendor-products'],
        exact: false,
        refetchType: 'active',
      });
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: ['vendor-product', variables.productId],
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
      queryClient.invalidateQueries({ queryKey: ['vendor-product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
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
        queryKey: ['vendor-products'],
        exact: false,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['vendor-product', variables.productId],
        exact: true,
      });
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
      const { data } = await Axios.delete<DeleteProductCustomizationGroupResponse>(
        `/apps/deliveries/products/customization-groups/${id}`,
      );

      return data;
    },
    retry: false,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-products'],
        exact: false,
        refetchType: 'active',
      });
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: ['vendor-product', variables.productId],
          exact: true,
        });
      }
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
