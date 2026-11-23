import {
  ApiErrorResponse,
  CommissionRateResponse,
  GetStoreCommissionRatesQueryParams,
  GetStoreCommissionRatesResponse,
  GetZoneCommissionRatesQueryParams,
  GetZoneCommissionRatesResponse,
  UpdateCommissionRatePayload,
  UpdateCommissionRateResponse,
  UpdateStoreCommissionRatePayload,
  UpdateStoreCommissionRateResponse,
  UpdateZoneCommissionRatePayload,
  UpdateZoneCommissionRateResponse,
} from '@/types';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import Axios from '@/config/axios';
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';

const GLOBAL_COMMISSION_RATE_QUERY_KEY = ['global-commission-rate'] as const;
const GLOBAL_COMMISSION_RATE_ENDPOINT =
  '/apps/deliveries/admin/commission-management/global';
const STORE_COMMISSION_RATES_QUERY_KEY = ['store-commission-rates'] as const;
const STORE_COMMISSION_RATES_ENDPOINT =
  '/apps/deliveries/admin/commission-management/stores';
const ZONE_COMMISSION_RATES_QUERY_KEY = ['zone-commission-rates'] as const;
const ZONE_COMMISSION_RATES_ENDPOINT =
  '/apps/deliveries/admin/commission-management/zones';

type GetCommissionRateOptions = Omit<
  UseQueryOptions<CommissionRateResponse, ApiErrorResponse>,
  'queryKey' | 'queryFn'
>;

type UpdateCommissionRateVariables = {
  id: string;
  payload: UpdateCommissionRatePayload;
};

type UpdateCommissionRateOptions = UseMutationOptions<
  UpdateCommissionRateResponse,
  ApiErrorResponse,
  UpdateCommissionRateVariables
>;

type GetStoreCommissionRatesOptions = Omit<
  UseQueryOptions<GetStoreCommissionRatesResponse, ApiErrorResponse>,
  'queryKey' | 'queryFn'
>;

type GetZoneCommissionRatesOptions = Omit<
  UseQueryOptions<GetZoneCommissionRatesResponse, ApiErrorResponse>,
  'queryKey' | 'queryFn'
>;

type UpdateZoneCommissionRateVariables = {
  zoneId: string;
  payload: UpdateZoneCommissionRatePayload;
};
type UpdateStoreCommissionRateVariables = {
  storeId: string;
  payload: UpdateStoreCommissionRatePayload;
};

type UpdateZoneCommissionRateOptions = UseMutationOptions<
  UpdateZoneCommissionRateResponse,
  ApiErrorResponse,
  UpdateZoneCommissionRateVariables
>;
type UpdateStoreCommissionRateOptions = UseMutationOptions<
  UpdateStoreCommissionRateResponse,
  ApiErrorResponse,
  UpdateStoreCommissionRateVariables
>;

export const useGetCommissionRate = (options?: GetCommissionRateOptions) =>
  useQuery<CommissionRateResponse, ApiErrorResponse>({
    queryKey: GLOBAL_COMMISSION_RATE_QUERY_KEY,
    queryFn: async () => {
      const { data } = await Axios.get<CommissionRateResponse>(
        GLOBAL_COMMISSION_RATE_ENDPOINT,
      );
      return data;
    },
    ...options,
  });

export const useUpdateCommissionRate = (
  options?: UpdateCommissionRateOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateCommissionRateResponse,
    ApiErrorResponse,
    UpdateCommissionRateVariables
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await Axios.patch<UpdateCommissionRateResponse>(
        `${GLOBAL_COMMISSION_RATE_ENDPOINT}/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: GLOBAL_COMMISSION_RATE_QUERY_KEY,
      });
    },
    ...options,
  });
};

export const useGetStoreCommissionRates = (
  params: GetStoreCommissionRatesQueryParams,
  options?: GetStoreCommissionRatesOptions,
) => {
  const modeScope = useDeliveriesAdminModeScope();
  return (
  useQuery<GetStoreCommissionRatesResponse, ApiErrorResponse>({
    queryKey: [STORE_COMMISSION_RATES_QUERY_KEY[0], params, modeScope ?? null],
    queryFn: async () => {
      const query = new URLSearchParams();

      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (modeScope) query.append('modeScope', modeScope);

      const { data } = await Axios.get<GetStoreCommissionRatesResponse>(
        `${STORE_COMMISSION_RATES_ENDPOINT}?${query.toString()}`,
      );

      return data;
    },
    ...options,
  }));
};

export const useGetZoneCommissionRates = (
  params: GetZoneCommissionRatesQueryParams,
  options?: GetZoneCommissionRatesOptions,
) =>
  useQuery<GetZoneCommissionRatesResponse, ApiErrorResponse>({
    queryKey: [ZONE_COMMISSION_RATES_QUERY_KEY[0], params],
    queryFn: async () => {
      const query = new URLSearchParams();

      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);

      const { data } = await Axios.get<GetZoneCommissionRatesResponse>(
        `${ZONE_COMMISSION_RATES_ENDPOINT}?${query.toString()}`,
      );

      return data;
    },
    ...options,
  });

export const useUpdateZoneCommissionRate = (
  options?: UpdateZoneCommissionRateOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateZoneCommissionRateResponse,
    ApiErrorResponse,
    UpdateZoneCommissionRateVariables
  >({
    mutationFn: async ({ zoneId, payload }) => {
      const { data } = await Axios.patch<UpdateZoneCommissionRateResponse>(
        `${ZONE_COMMISSION_RATES_ENDPOINT}/${zoneId}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ZONE_COMMISSION_RATES_QUERY_KEY });
    },
    ...options,
  });
};



export const useUpdateStoreCommissionRate = (
  options?: UpdateStoreCommissionRateOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateStoreCommissionRateResponse,
    ApiErrorResponse,
    UpdateStoreCommissionRateVariables
  >({
    mutationFn: async ({ storeId, payload }) => {
      const { data } = await Axios.patch<UpdateStoreCommissionRateResponse>(
        `${STORE_COMMISSION_RATES_ENDPOINT}/${storeId}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORE_COMMISSION_RATES_QUERY_KEY });
    },
    ...options,
  });
};
