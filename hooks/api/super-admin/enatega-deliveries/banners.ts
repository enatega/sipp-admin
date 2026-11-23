import { ApiErrorResponse } from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  EnategaBannerActionType,
  EnategaDeliveriesBannerDropdownQueryParams,
  EnategaDeliveriesBannerDropdownResponse,
  EnategaDeliveriesDeleteBannerResponse,
  EnategaDeliveriesGetBannersQueryParams,
  EnategaDeliveriesGetBannersResponse,
  EnategaDeliveriesPatchBannerPayload,
  EnategaDeliveriesPatchBannerResponse,
  EnategaDeliveriesPostBannerPayload,
  EnategaDeliveriesPostBannerResponse,
} from '@/types/api/super-admin/enatega-deliveries/banners.api';
import Axios from '@/config/axios';
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';
import { useQueryParams } from '@/hooks/use-query-params';

const BANNERS_QUERY_KEY = ['get-enatega-deliveries-banners'] as const;
const BANNERS_ENDPOINT = '/apps/deliveries/admin/banner-management';
const BANNER_DROPDOWN_STORES_QUERY_KEY = [
  'enatega-deliveries-banner-stores-dropdown',
] as const;
const BANNER_DROPDOWN_PRODUCTS_QUERY_KEY = [
  'enatega-deliveries-banner-products-dropdown',
] as const;
const BANNER_DROPDOWN_SHOP_TYPES_QUERY_KEY = [
  'enatega-deliveries-banner-shop-types-dropdown',
] as const;

const getBannerRelationByActionType = (
  actionType: EnategaBannerActionType,
  payload: {
    related_store?: string | null;
    related_product?: string | null;
    related_shop_type?: string | null;
  },
) => {
  if (actionType === 'store') {
    return {
      related_store: payload.related_store ?? '',
      related_product: '',
      related_shop_type: '',
    };
  }

  if (actionType === 'product') {
    return {
      related_store: '',
      related_product: payload.related_product ?? '',
      related_shop_type: '',
    };
  }

  if (actionType === 'shop_type') {
    return {
      related_store: '',
      related_product: '',
      related_shop_type: payload.related_shop_type ?? '',
    };
  }

  return {
    related_store: '',
    related_product: '',
    related_shop_type: '',
  };
};

export function useGetBanners(
  options?: Omit<
    UseQueryOptions<EnategaDeliveriesGetBannersResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  const { getParam } = useQueryParams();
  const modeScope = useDeliveriesAdminModeScope();

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;
  const startDate = getParam('startDate') || undefined;
  const endDate = getParam('endDate') || undefined;

  const params: EnategaDeliveriesGetBannersQueryParams = {
    page,
    limit,
    search,
    startDate,
    endDate,
    modeScope,
  };

  return useQuery<EnategaDeliveriesGetBannersResponse, ApiErrorResponse>({
    queryKey: [...BANNERS_QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await Axios.get<EnategaDeliveriesGetBannersResponse>(
        BANNERS_ENDPOINT,
        {
          params,
        },
      );
      return data;
    },
    ...options,
  });
}

export function usePostBanner(
  options?: UseMutationOptions<
    EnategaDeliveriesPostBannerResponse,
    ApiErrorResponse,
    EnategaDeliveriesPostBannerPayload
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    EnategaDeliveriesPostBannerResponse,
    ApiErrorResponse,
    EnategaDeliveriesPostBannerPayload
  >({
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('description', payload.description);
      formData.append('action_type', payload.action_type);

      const relations = getBannerRelationByActionType(
        payload.action_type,
        payload,
      );
      formData.append('related_store', relations.related_store);
      formData.append('related_product', relations.related_product);
      formData.append('related_shop_type', relations.related_shop_type);

      if (payload.image instanceof File) {
        formData.append('image', payload.image);
      }
      if (payload.video instanceof File) {
        formData.append('video', payload.video);
      }

      const { data } = await Axios.post<EnategaDeliveriesPostBannerResponse>(
        BANNERS_ENDPOINT,
        formData,
      );
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: BANNERS_QUERY_KEY,
        exact: false,
        refetchType: 'all',
      });
    },
    ...options,
  });
}

export function usePatchBanner(
  options?: UseMutationOptions<
    EnategaDeliveriesPatchBannerResponse,
    ApiErrorResponse,
    EnategaDeliveriesPatchBannerPayload
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    EnategaDeliveriesPatchBannerResponse,
    ApiErrorResponse,
    EnategaDeliveriesPatchBannerPayload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const formData = new FormData();

      if (payload.title !== undefined) formData.append('title', payload.title);
      if (payload.description !== undefined) {
        formData.append('description', payload.description);
      }
      if (payload.action_type !== undefined) {
        formData.append('action_type', payload.action_type);
        const relations = getBannerRelationByActionType(
          payload.action_type,
          payload,
        );
        formData.append('related_store', relations.related_store);
        formData.append('related_product', relations.related_product);
        formData.append('related_shop_type', relations.related_shop_type);
      } else {
        if (payload.related_store !== undefined) {
          formData.append('related_store', payload.related_store ?? '');
        }
        if (payload.related_product !== undefined) {
          formData.append('related_product', payload.related_product ?? '');
        }
        if (payload.related_shop_type !== undefined) {
          formData.append('related_shop_type', payload.related_shop_type ?? '');
        }
      }
      if (payload.image instanceof File) {
        formData.append('image', payload.image);
      }
      if (payload.video instanceof File) {
        formData.append('video', payload.video);
      }

      const { data } = await Axios.patch<EnategaDeliveriesPatchBannerResponse>(
        `${BANNERS_ENDPOINT}/${id}`,
        formData,
      );
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: BANNERS_QUERY_KEY,
        exact: false,
        refetchType: 'all',
      });
    },
    ...options,
  });
}

export function useDeleteBanner(
  options?: UseMutationOptions<
    EnategaDeliveriesDeleteBannerResponse,
    ApiErrorResponse,
    string
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    EnategaDeliveriesDeleteBannerResponse,
    ApiErrorResponse,
    string
  >({
    mutationFn: async (id) => {
      const { data } =
        await Axios.delete<EnategaDeliveriesDeleteBannerResponse>(
          `${BANNERS_ENDPOINT}/${id}`,
        );
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: BANNERS_QUERY_KEY,
        exact: false,
        refetchType: 'all',
      });
    },
    ...options,
  });
}

function useBannerDropdownQuery(
  path: string,
  queryKey: readonly string[],
  params?: EnategaDeliveriesBannerDropdownQueryParams,
  options?: Omit<
    UseQueryOptions<EnategaDeliveriesBannerDropdownResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  const modeScope = useDeliveriesAdminModeScope();
  return useQuery<EnategaDeliveriesBannerDropdownResponse, ApiErrorResponse>({
    queryKey: [...queryKey, params ?? {}, modeScope ?? null],
    queryFn: async () => {
      const { data } = await Axios.get<EnategaDeliveriesBannerDropdownResponse>(
        `${BANNERS_ENDPOINT}/dropdown/${path}`,
        {
          params: {
            offset: params?.offset ?? 0,
            limit: params?.limit ?? 10,
            page: params?.page ?? 1,
            search: params?.search || undefined,
            modeScope,
          },
        },
      );

      return data;
    },
    ...options,
  });
}

export function useGetBannerStoresDropdown(
  params?: EnategaDeliveriesBannerDropdownQueryParams,
  options?: Omit<
    UseQueryOptions<EnategaDeliveriesBannerDropdownResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useBannerDropdownQuery(
    'stores',
    BANNER_DROPDOWN_STORES_QUERY_KEY,
    params,
    options,
  );
}

export function useGetBannerProductsDropdown(
  params?: EnategaDeliveriesBannerDropdownQueryParams,
  options?: Omit<
    UseQueryOptions<EnategaDeliveriesBannerDropdownResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useBannerDropdownQuery(
    'products',
    BANNER_DROPDOWN_PRODUCTS_QUERY_KEY,
    params,
    options,
  );
}

export function useGetBannerShopTypesDropdown(
  params?: EnategaDeliveriesBannerDropdownQueryParams,
  options?: Omit<
    UseQueryOptions<EnategaDeliveriesBannerDropdownResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useBannerDropdownQuery(
    'shop-types',
    BANNER_DROPDOWN_SHOP_TYPES_QUERY_KEY,
    params,
    options,
  );
}
