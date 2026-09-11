import Axios from '@/config/axios';
import {
  ApiErrorResponse,
} from '@/types';
import type {
  CreateLoyaltyPointsRangePayload,
  CreateLoyaltyPointsRangeResponse,
  DeleteLoyaltyPointsRangeResponse,
  GetLoyaltyPointsRangeResponse,
  UpdateLoyaltyPointsRangePayload,
  UpdateLoyaltyPointsRangeResponse,
} from '@/types/api/super-admin/enatega-deliveries/loyalty.api';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

const ENDPOINTS = {
  getAll: '/apps/deliveries/admin/loyalty-points-range/all',
  create: '/apps/deliveries/admin/loyalty-points-range/customer/create',
  getById: (id: string) => `/apps/deliveries/admin/loyalty-points-range/${id}`,
  update: (id: string) => `/apps/deliveries/admin/loyalty-points-range/${id}`,
  delete: (id: string) => `/apps/deliveries/admin/loyalty-points-range/${id}`,
};

const QUERY_KEY = ['loyalty-points-range'] as const;

/**
 * Hook to fetch customer loyalty points range breakdown
 * @param options - React Query options
 * @returns Query result with loyalty points range data
 */
export const useGetLoyaltyPointsRange = (
  options?: Omit<
    UseQueryOptions<
      GetLoyaltyPointsRangeResponse,
      ApiErrorResponse,
      GetLoyaltyPointsRangeResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<GetLoyaltyPointsRangeResponse, ApiErrorResponse>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await Axios.get<GetLoyaltyPointsRangeResponse>(ENDPOINTS.getAll);
      return res.data;
    },
    retry: false,
    ...options,
  });
};

/**
 * Hook to fetch customer loyalty points range by ID
 * @param id - Loyalty points range ID
 * @param options - React Query options
 * @returns Query result with loyalty points range data
 */
export const useGetLoyaltyPointsRangeById = (
  id: string,
  options?: Omit<
    UseQueryOptions<
      GetLoyaltyPointsRangeResponse,
      ApiErrorResponse,
      GetLoyaltyPointsRangeResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<GetLoyaltyPointsRangeResponse, ApiErrorResponse>({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const res = await Axios.get<GetLoyaltyPointsRangeResponse>(ENDPOINTS.getById(id));
      return res.data;
    },
    enabled: !!id,
    retry: false,
    ...options,
  });
};

/**
 * Hook to create a new loyalty points range
 * @param options - React Query mutation options
 * @returns Mutation result for creating loyalty points range
 */
export const useCreateLoyaltyPointsRange = (
  options?: UseMutationOptions<
    CreateLoyaltyPointsRangeResponse,
    ApiErrorResponse,
    CreateLoyaltyPointsRangePayload
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateLoyaltyPointsRangeResponse,
    ApiErrorResponse,
    CreateLoyaltyPointsRangePayload
  >({
    mutationFn: async (payload) => {
      const { data } = await Axios.post<CreateLoyaltyPointsRangeResponse>(
        ENDPOINTS.create,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook to update a loyalty points range
 * @param options - React Query mutation options
 * @returns Mutation result for updating loyalty points range
 */
export const useUpdateLoyaltyPointsRange = (
  options?: UseMutationOptions<
    UpdateLoyaltyPointsRangeResponse,
    ApiErrorResponse,
    { id: string; payload: UpdateLoyaltyPointsRangePayload }
  >
) => {
  const queryClient = useQueryClient();

    return useMutation<
    UpdateLoyaltyPointsRangeResponse,
    ApiErrorResponse,
    { id: string; payload: UpdateLoyaltyPointsRangePayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await Axios.patch<UpdateLoyaltyPointsRangeResponse>(
        ENDPOINTS.update(id),
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook to delete a loyalty points range
 * @param options - React Query mutation options
 * @returns Mutation result for deleting loyalty points range
 */
export const useDeleteLoyaltyPointsRange = (
  options?: UseMutationOptions<
    DeleteLoyaltyPointsRangeResponse,
    ApiErrorResponse,
    string
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteLoyaltyPointsRangeResponse, ApiErrorResponse, string>({
    mutationFn: async (id) => {
      const { data } = await Axios.delete<DeleteLoyaltyPointsRangeResponse>(
        ENDPOINTS.delete(id)
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    ...options,
  });
};
