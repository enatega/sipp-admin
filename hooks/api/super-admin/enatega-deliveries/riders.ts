import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  CreateDeliveryRiderPayload,
  CreateDeliveryRiderResponse,
  DeleteDeliveryRiderResponse,
  GetDeliveryRiderResponse,
  GetDeliveryRidersResponse,
  GetRidersQueryParams,
  GetVehicleTypesResponse,
  UpdateDeliveryRiderPayload,
  UpdateDeliveryRiderResponse,
  UpdateRiderBlockStatusPayload,
  UpdateRiderBlockStatusResponse,
  UpdateRiderStatusPayload,
  UpdateRiderStatusResponse,
  ValidateRiderBasicInfoPayload,
  ValidateRiderBasicInfoResponse,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

/**
 * Hook to fetch all riders with pagination and filters
 * @param options - React Query options
 */
export const useGetDeliveryRiders = (
  options?: Omit<UseQueryOptions<GetDeliveryRidersResponse, ApiErrorResponse, GetDeliveryRidersResponse, readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  const { getParam } = useQueryParams();

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const offset = (page - 1) * limit;
  const search = getParam('search') || undefined;
  const status = getParam('status') || undefined;
  const tabParam = getParam('tab');
  const tab = tabParam === 'all' || !tabParam ? undefined : tabParam; // Normalize 'all' to undefined
  const vehicleType = getParam('vehicleType') || undefined;
  const rating = getParam('rating') ? Number(getParam('rating')) : undefined;
  const startDate = getParam('start_date') || undefined;
  const endDate = getParam('end_date') || undefined;
  const zoneId = getParam('zoneId') || undefined;

  const params: GetRidersQueryParams = useMemo(() => ({
    page,
    limit,
    offset,
    search,
    status: tab,
    kyc_status: status,
    vehicle_type: vehicleType,
    rating,
    start_date: startDate,
    end_date: endDate,
    zoneIds: zoneId,
  }), [endDate, limit, offset, page, rating, search, startDate, status, tab, vehicleType, zoneId]);

  const queryKey = ['get-riders', params];

  const fetchRiders = useCallback(async (
    requestParams: GetRidersQueryParams
  ): Promise<GetDeliveryRidersResponse> => {
    const query = new URLSearchParams();
    if (requestParams.offset !== undefined) query.append('offset', String(requestParams.offset));
    if (requestParams.page !== undefined) query.append('page', String(requestParams.page));
    if (requestParams.limit !== undefined) query.append('limit', String(requestParams.limit));
    if (requestParams.search) query.append('search', requestParams.search);
    if (requestParams.status && requestParams.status !== "all") query.append('status', requestParams.status);
    if (requestParams.kyc_status) query.append('kyc_status', requestParams.kyc_status);
    if (requestParams.vehicle_type) query.append('vehicle_type', requestParams.vehicle_type);
    if (requestParams.rating !== undefined) query.append('rating', String(requestParams.rating));
    if (requestParams.start_date) query.append('start_date', requestParams.start_date);
    if (requestParams.end_date) query.append('end_date', requestParams.end_date);
    if (requestParams.zoneIds) query.append('zoneIds', requestParams.zoneIds);

    const apiUrl = `/apps/deliveries/admin/riders?${query.toString()}`;
    const res = await Axios.get<GetDeliveryRidersResponse>(apiUrl);
    return res.data;
  }, []);

  return useQuery<GetDeliveryRidersResponse, ApiErrorResponse>({
    queryKey,
    queryFn: () => fetchRiders(params),
    placeholderData: (previous) => previous,
    ...options,
  });
};

/**
 * Hook to fetch all vehicle types for riders
 * @param options - React Query options
 */
export function useGetVehicleTypes(
  options?: Omit<UseQueryOptions<GetVehicleTypesResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetVehicleTypesResponse, ApiErrorResponse>({
    queryKey: ['vehicle-types'],
    queryFn: async () => {
      const { data } = await Axios.get<GetVehicleTypesResponse>(
        '/apps/deliveries/admin/riders/filters/vehicle-types'
      );
      return data;
    },
    ...options,
  });
}

/**
 * Hook to update rider status (approve/reject)
 * @param options - React Query mutation options
 */
export const useUpdateRiderStatus = (
  options?: UseMutationOptions<
    UpdateRiderStatusResponse,
    ApiErrorResponse,
    UpdateRiderStatusPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<UpdateRiderStatusResponse, ApiErrorResponse, UpdateRiderStatusPayload>({
    mutationFn: async (payload) => {
      const res = await Axios.patch<UpdateRiderStatusResponse>(
        `/apps/deliveries/admin/riders/riders/${payload.riderId}/status`,
        {
          status: payload.status,
          rejection_reason: payload.rejection_reason || '',
        }
      );
      return res.data;
    },
    onSuccess: (data, variables, context, meta) => {
      // Invalidate riders query to refetch data
      queryClient.invalidateQueries({
        queryKey: ['get-riders'],
        exact: false,
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ queryKey: ['get-rider', variables.riderId] });
      options?.onSuccess?.(data, variables, context, meta);
    },
    ...options,
  });
};

/**
 * Convenience hook to approve a rider
 * @param options - React Query mutation options
 */
export const useApproveDeliveryRider = (
  options?: Omit<
    UseMutationOptions<
      UpdateRiderStatusResponse,
      ApiErrorResponse,
      { riderId: string }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateRiderStatusResponse,
    ApiErrorResponse,
    { riderId: string }
  >({
    mutationFn: async ({ riderId }) => {
      const res = await Axios.patch<UpdateRiderStatusResponse>(
        `/apps/deliveries/admin/riders/riders/${riderId}/status`,
        {
          status: 'approved',
          rejection_reason: '',
        }
      );
      return res.data;
    },
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({
        queryKey: ['get-riders'],
        exact: false,
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ queryKey: ['get-rider', variables.riderId] });
      options?.onSuccess?.(data, variables, context, meta);
    },
    ...options,
  });
};

/**
 * Convenience hook to reject a rider
 * @param options - React Query mutation options
 */
export const useRejectDeliveryRider = (
  options?: Omit<
    UseMutationOptions<
      UpdateRiderStatusResponse,
      ApiErrorResponse,
      { riderId: string; rejectionReason: string }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateRiderStatusResponse,
    ApiErrorResponse,
    { riderId: string; rejectionReason: string }
  >({
    mutationFn: async ({ riderId, rejectionReason }) => {
      const res = await Axios.patch<UpdateRiderStatusResponse>(
        `/apps/deliveries/admin/riders/riders/${riderId}/status`,
        {
          status: 'rejected',
          rejection_reason: rejectionReason,
        }
      );
      return res.data;
    },
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({
        queryKey: ['get-riders'],
        exact: false,
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ queryKey: ['get-rider', variables.riderId] });
      options?.onSuccess?.(data, variables, context, meta);
    },
    ...options,
  });
};

/**
 * Hook to delete a rider
 * @param options - React Query mutation options
 */
export const useDeleteDeliveryRider = (
  options?: UseMutationOptions<DeleteDeliveryRiderResponse, ApiErrorResponse, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<DeleteDeliveryRiderResponse, ApiErrorResponse, string>({
    mutationFn: async (riderId) => {
      const res = await Axios.delete<DeleteDeliveryRiderResponse>(
        `/apps/deliveries/admin/riders/riders/${riderId}`
      );
      return res.data;
    },
    onSuccess: (...args) => {
      // Invalidate riders query to refetch data
      queryClient.invalidateQueries({
        queryKey: ['get-riders'],
        exact: false,
        refetchType: 'active'
      });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

/**
 * Hook to update rider block status
 * @param options - React Query mutation options
 */
export const useUpdateRiderBlockStatus = (
  options?: UseMutationOptions<
    UpdateRiderBlockStatusResponse,
    ApiErrorResponse,
    UpdateRiderBlockStatusPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<UpdateRiderBlockStatusResponse, ApiErrorResponse, UpdateRiderBlockStatusPayload>({
    mutationFn: async (payload) => {
      const res = await Axios.patch<UpdateRiderBlockStatusResponse>(
        '/apps/deliveries/admin/riders/riders/block-status',
        {
          riderId: payload.riderId,
          blockStatus: payload.blockStatus,
        }
      );
      return res.data;
    },
    onSuccess: (data, variables, context, meta) => {
      // Invalidate riders query to refetch data
      queryClient.invalidateQueries({
        queryKey: ['get-riders'],
        exact: false,
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ queryKey: ['get-rider', variables.riderId] });
      options?.onSuccess?.(data, variables, context, meta);
    },
    ...options,
  });
};

/**
 * Convenience hook to block a rider
 * @param options - React Query mutation options
 */
export const useBlockDeliveryRider = (
  options?: Omit<
    UseMutationOptions<
      UpdateRiderBlockStatusResponse,
      ApiErrorResponse,
      { riderId: string }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateRiderBlockStatusResponse,
    ApiErrorResponse,
    { riderId: string }
  >({
    mutationFn: async ({ riderId }) => {
      const res = await Axios.patch<UpdateRiderBlockStatusResponse>(
        '/apps/deliveries/admin/riders/riders/block-status',
        {
          riderId,
          blockStatus: true,
        }
      );
      return res.data;
    },
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({
        queryKey: ['get-riders'],
        exact: false,
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ queryKey: ['get-rider', variables.riderId] });
      options?.onSuccess?.(data, variables, context, meta);
    },
    ...options,
  });
};

/**
 * Convenience hook to unblock a rider
 * @param options - React Query mutation options
 */
export const useUnblockDeliveryRider = (
  options?: Omit<
    UseMutationOptions<
      UpdateRiderBlockStatusResponse,
      ApiErrorResponse,
      { riderId: string }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateRiderBlockStatusResponse,
    ApiErrorResponse,
    { riderId: string }
  >({
    mutationFn: async ({ riderId }) => {
      const res = await Axios.patch<UpdateRiderBlockStatusResponse>(
        '/apps/deliveries/admin/riders/riders/block-status',
        {
          riderId,
          blockStatus: false,
        }
      );
      return res.data;
    },
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({
        queryKey: ['get-riders'],
        exact: false,
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ queryKey: ['get-rider', variables.riderId] });
      options?.onSuccess?.(data, variables, context, meta);
    },
    ...options,
  });
};

/**
 * Hook to fetch a single rider by ID
 * @param riderId - The ID of the rider to fetch
 * @param options - React Query options
 */
export const useGetDeliveryRider = (
  riderId: string,
  options?: Omit<UseQueryOptions<GetDeliveryRiderResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<GetDeliveryRiderResponse, ApiErrorResponse>({
    queryKey: ['get-rider', riderId],
    queryFn: async () => {
      const { data } = await Axios.get<GetDeliveryRiderResponse>(
        `/apps/deliveries/admin/riders/riders/${riderId}`
      );
      return data;
    },
    enabled: !!riderId,
    ...options,
  });
};

/**
 * Hook to update a rider
 * @param options - React Query mutation options
 */
export const useUpdateDeliveryRider = (
  options?: UseMutationOptions<
    UpdateDeliveryRiderResponse,
    ApiErrorResponse,
    UpdateDeliveryRiderPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<UpdateDeliveryRiderResponse, ApiErrorResponse, UpdateDeliveryRiderPayload>({
    mutationFn: async (payload) => {
      const formData = new FormData();

      // Add required fields
      formData.append('rider_id', payload.rider_id);

      // Add optional fields
      if (payload.name) formData.append('name', payload.name);
      if (payload.email) formData.append('email', payload.email);
      if (payload.password) formData.append('password', payload.password);
      if (payload.phone) formData.append('phone', payload.phone);
      if (payload.zone_id) formData.append('zone_id', payload.zone_id);
      if (payload.city) formData.append('city', payload.city);
      if (payload.licenseNumber) formData.append('licenseNumber', payload.licenseNumber);
      if (payload.vehicle_name) formData.append('vehicle_name', payload.vehicle_name);
      if (payload.vehicle_colour) formData.append('vehicle_colour', payload.vehicle_colour);
      if (payload.vehicle_no) formData.append('vehicle_no', payload.vehicle_no);
      if (payload.model_year_limit !== undefined) formData.append('model_year_limit', String(payload.model_year_limit));
      if (payload.is_four_wheeler !== undefined) formData.append('is_four_wheeler', String(payload.is_four_wheeler));
      if (payload.air_conditioning !== undefined) formData.append('air_conditioning', String(payload.air_conditioning));
      if (payload.no_cosmetic_damage !== undefined) formData.append('no_cosmetic_damage', String(payload.no_cosmetic_damage));
      if (payload.helmet !== undefined) formData.append('helmet', String(payload.helmet));
      if (payload.availabilityStatus) formData.append('availabilityStatus', payload.availabilityStatus);
      if (payload.type) formData.append('type', payload.type);
      if (payload.is_approved !== undefined) formData.append('is_approved', String(payload.is_approved));
      if (payload.status) formData.append('status', payload.status);
      if (payload.tier_id) formData.append('tier_id', payload.tier_id);
      if (payload.is_onboarding_completed !== undefined) formData.append('is_onboarding_completed', String(payload.is_onboarding_completed));
      if (payload.cod_limit_enabled !== undefined) formData.append('cod_limit_enabled', String(payload.cod_limit_enabled));
      if (payload.cod_limit_amount !== undefined) formData.append('cod_limit_amount', String(payload.cod_limit_amount));
      if (payload.cod_warning_threshold !== undefined) formData.append('cod_warning_threshold', String(payload.cod_warning_threshold));
      if (payload.cod_auto_settlement_cycle) formData.append('cod_auto_settlement_cycle', payload.cod_auto_settlement_cycle);
      if (payload.cod_allow_online_payments_when_blocked !== undefined) {
        formData.append(
          'cod_allow_online_payments_when_blocked',
          String(payload.cod_allow_online_payments_when_blocked),
        );
      }
      if (payload.platformCommissionPercentage !== undefined) {
        formData.append(
          'platformCommissionPercentage',
          String(payload.platformCommissionPercentage),
        );
      }

      // Add file fields
      if (payload.driver_license_front instanceof File) formData.append('driver_license_front', payload.driver_license_front);
      if (payload.driver_license_back instanceof File) formData.append('driver_license_back', payload.driver_license_back);
      if (payload.national_id_passport_front instanceof File) formData.append('national_id_passport_front', payload.national_id_passport_front);
      if (payload.national_id_passport_back instanceof File) formData.append('national_id_passport_back', payload.national_id_passport_back);
      if (payload.vehicle_registration_front instanceof File) formData.append('vehicle_registration_front', payload.vehicle_registration_front);
      if (payload.vehicle_registration_back instanceof File) formData.append('vehicle_registration_back', payload.vehicle_registration_back);
      if (payload.company_commercial_registration instanceof File) formData.append('company_commercial_registration', payload.company_commercial_registration);
      if (payload.profile_image instanceof File) formData.append('profile_image', payload.profile_image);

      const res = await Axios.put<UpdateDeliveryRiderResponse>(
        '/apps/deliveries/admin/riders/update',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data;
    },
    onSuccess: (...args) => {
      // Invalidate rider queries to refetch data
      queryClient.invalidateQueries({
        queryKey: ['get-rider'],
        exact: false,
        refetchType: 'active'
      });
      queryClient.invalidateQueries({
        queryKey: ['get-riders'],
        exact: false,
        refetchType: 'active'
      });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

/**
 * Hook to validate rider basic information
 * @param options - React Query mutation options
 */
export const useValidateRiderBasicInfo = (
  options?: UseMutationOptions<
    ValidateRiderBasicInfoResponse,
    ApiErrorResponse,
    ValidateRiderBasicInfoPayload
  >
) => {
  return useMutation<
    ValidateRiderBasicInfoResponse,
    ApiErrorResponse,
    ValidateRiderBasicInfoPayload
  >({
    mutationFn: async (payload) => {
      const res = await Axios.post<ValidateRiderBasicInfoResponse>(
        '/apps/deliveries/admin/riders/validate/basic-information',
        payload
      );
      return res.data;
    },
    retry: false,
    ...options,
  });
};

/**
 * Hook to create a new rider
 * @param options - React Query mutation options
 */
export const useCreateDeliveryRider = (
  options?: UseMutationOptions<
    CreateDeliveryRiderResponse,
    ApiErrorResponse,
    CreateDeliveryRiderPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    CreateDeliveryRiderResponse,
    ApiErrorResponse,
    CreateDeliveryRiderPayload
  >({
    mutationFn: async (payload) => {
      const formData = new FormData();

      // Add all required fields
      formData.append('name', payload.name);
      formData.append('email', payload.email);
      formData.append('password', payload.password);
      formData.append('phone', payload.phone);
      if (payload.city) formData.append('city', payload.city);
      formData.append('vehicle_type', payload.vehicle_type);
      formData.append('driver_license_front', payload.driver_license_front);
      formData.append('driver_license_back', payload.driver_license_back);
      formData.append('national_id_passport_front', payload.national_id_passport_front);
      formData.append('national_id_passport_back', payload.national_id_passport_back);
      formData.append('vehicle_registration_front', payload.vehicle_registration_front);
      formData.append('vehicle_registration_back', payload.vehicle_registration_back);
      formData.append('model_year_limit', String(payload.model_year_limit));
      formData.append('insulated_delivery_bag', String(payload.insulated_delivery_bag));
      formData.append('zone_id', payload.zone_id);
      formData.append('licenseNumber', payload.licenseNumber);
      formData.append('vehicle_name', payload.vehicle_name);
      formData.append('vehicle_colour', payload.vehicle_colour);
      formData.append('vehicle_no', payload.vehicle_no);

      // Add optional fields
      if (payload.company_commercial_registration) {
        formData.append('company_commercial_registration', payload.company_commercial_registration);
      }
      if (payload.profile_image) {
        formData.append('profile_image', payload.profile_image);
      }
      if (payload.is_four_wheeler !== undefined) {
        formData.append('is_four_wheeler', String(payload.is_four_wheeler));
      }
      if (payload.air_conditioning !== undefined) {
        formData.append('air_conditioning', String(payload.air_conditioning));
      }
      if (payload.change_password_allowed !== undefined) {
        formData.append('change_password_allowed', String(payload.change_password_allowed));
      }
      if (payload.bike_good_condition !== undefined) {
        formData.append('bike_good_condition', String(payload.bike_good_condition));
      }
      if (payload.helmet !== undefined) {
        formData.append('helmet', String(payload.helmet));
      }
      if (payload.cod_limit_enabled !== undefined) {
        formData.append('cod_limit_enabled', String(payload.cod_limit_enabled));
      }
      if (payload.cod_limit_amount !== undefined) {
        formData.append('cod_limit_amount', String(payload.cod_limit_amount));
      }
      if (payload.cod_warning_threshold !== undefined) {
        formData.append(
          'cod_warning_threshold',
          String(payload.cod_warning_threshold),
        );
      }
      if (payload.cod_auto_settlement_cycle) {
        formData.append(
          'cod_auto_settlement_cycle',
          payload.cod_auto_settlement_cycle,
        );
      }
      if (payload.cod_allow_online_payments_when_blocked !== undefined) {
        formData.append(
          'cod_allow_online_payments_when_blocked',
          String(payload.cod_allow_online_payments_when_blocked),
        );
      }
      if (payload.platformCommissionPercentage !== undefined) {
        formData.append(
          'platformCommissionPercentage',
          String(payload.platformCommissionPercentage),
        );
      }

      const res = await Axios.post<CreateDeliveryRiderResponse>(
        '/apps/deliveries/admin/riders/riders',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data;
    },
    onSuccess: (...args) => {
      // Invalidate riders query to refetch data
      queryClient.invalidateQueries({ queryKey: ['get-riders'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};
