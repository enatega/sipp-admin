import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  DeleteDeliveriesZoneResponse,
  DeliveriesZone,
  GetDeliveriesZonesQueryParams,
  GetDeliveriesZonesResponse,
  PostDeliveriesZonePayload,
  PutDeliveriesZonePayload,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

const DELIVERIES_ZONES_ENDPOINT = '/zones';
const DELIVERIES_ZONES_QUERY_KEY = ['deliveries-zones'];

export const useGetDeliveriesZones = (
  options?: Omit<
    UseQueryOptions<
      GetDeliveriesZonesResponse,
      ApiErrorResponse,
      GetDeliveriesZonesResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();

  const page = Number(getParam('deliveriesPage')) || 1;
  const limit = Number(getParam('deliveriesLimit')) || 10;
  const search = getParam('deliveriesSearch') || undefined;
  const startDate = getParam('deliveriesStartDate') || undefined;
  const endDate = getParam('deliveriesEndDate') || undefined;

  const params: GetDeliveriesZonesQueryParams = {
    page,
    limit,
    search,
    startDate,
    endDate,
  };

  return useQuery<GetDeliveriesZonesResponse, ApiErrorResponse>({
    queryKey: [...DELIVERIES_ZONES_QUERY_KEY, params],
    queryFn: async () => {
      const response = await Axios.get<GetDeliveriesZonesResponse>(
        DELIVERIES_ZONES_ENDPOINT,
        {
          params,
        },
      );
      return response.data;
    },
    retry: false,
    ...options,
  });
};

export const usePostDeliveriesZone = (
  options?: UseMutationOptions<
    DeliveriesZone,
    ApiErrorResponse,
    PostDeliveriesZonePayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeliveriesZone,
    ApiErrorResponse,
    PostDeliveriesZonePayload
  >({
    mutationFn: async (payload) => {
      const response = await Axios.post<DeliveriesZone>(
        DELIVERIES_ZONES_ENDPOINT,
        payload,
      );
      return response.data;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: DELIVERIES_ZONES_QUERY_KEY,
      });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const usePutDeliveriesZone = (
  options?: UseMutationOptions<
    DeliveriesZone,
    ApiErrorResponse,
    PutDeliveriesZonePayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeliveriesZone,
    ApiErrorResponse,
    PutDeliveriesZonePayload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await Axios.put<DeliveriesZone>(
        `${DELIVERIES_ZONES_ENDPOINT}/${id}`,
        payload,
      );
      return response.data;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: DELIVERIES_ZONES_QUERY_KEY,
      });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteDeliveriesZone = (
  options?: UseMutationOptions<
    DeleteDeliveriesZoneResponse,
    ApiErrorResponse,
    string
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteDeliveriesZoneResponse,
    ApiErrorResponse,
    string
  >({
    mutationFn: async (id) => {
      const response = await Axios.delete<DeleteDeliveriesZoneResponse>(
        `${DELIVERIES_ZONES_ENDPOINT}/${id}`,
      );
      return response.data;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: DELIVERIES_ZONES_QUERY_KEY,
      });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

