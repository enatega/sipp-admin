import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import { useParams } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import {
  GetAssignedMenuProductsQueryParams,
  GetAssignedMenuProductsResponse,
  StoreAssignedMenuProductApi,
  StoreAssignedMenuProductsMenu,
} from '@/types/api/store/deliveries/assigned-menu-products.api';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

const PAGE_SIZE = 10;

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

const normalizeProduct = (
  product: StoreAssignedMenuProductApi,
): StoreAssignedMenuProductApi => ({
  ...product,
  image: product.image ?? null,
  subcategory: product.subcategory ?? null,
  unitOfMeasure: product.unitOfMeasure ?? null,
  description: product.description ?? null,
  inStock: Boolean(product.inStock),
  isActive: Boolean(product.isActive),
});

const normalizeMenu = (
  menu: StoreAssignedMenuProductsMenu,
): StoreAssignedMenuProductsMenu => ({
  ...menu,
  assignedStores: menu.assignedStores ?? [],
  products: (menu.products ?? []).map((product) => normalizeProduct(product)),
});

export const useGetAssignedMenuProducts = (
  options?: Omit<
    UseQueryOptions<
      GetAssignedMenuProductsResponse,
      ApiErrorResponse,
      GetAssignedMenuProductsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();
  const { storeId } = useParams() as { storeId?: string };

  const page = Number(getParam('page')) || 1;
  const offset = (page - 1) * PAGE_SIZE;

  const params: GetAssignedMenuProductsQueryParams | null = storeId
    ? {
        storeId,
        page,
        offset,
      }
    : null;

  return useQuery<GetAssignedMenuProductsResponse, ApiErrorResponse>({
    queryKey: ['store-assigned-menu-products', params],
    queryFn: async () => {
      const query = buildQuery({
        page: params?.page,
        offset: params?.offset,
      });

      const { data } = await Axios.get<GetAssignedMenuProductsResponse>(
        buildUrlWithQuery(
          `/apps/deliveries/chain-menus/store/${params!.storeId}/menus`,
          query,
        ),
      );

      return {
        ...data,
        data: (data.data ?? []).map(normalizeMenu),
        summary: {
          totalMenus: data.summary?.totalMenus ?? 0,
          availableMenus: data.summary?.availableMenus ?? 0,
          unavailableMenus: data.summary?.unavailableMenus ?? 0,
          totalProducts: data.summary?.totalProducts ?? 0,
          inStockProducts: data.summary?.inStockProducts ?? 0,
          outOfStockProducts: data.summary?.outOfStockProducts ?? 0,
        },
      };
    },
    enabled: !!params,
    retry: false,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};
