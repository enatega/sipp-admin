import Axios from '@/config/axios';
import buildFormData from '@/lib/build-form-data';
import {
    ApiErrorResponse,
    ChangePasswordPayload,
    ChangePasswordResponse,
    GetAdminSettingsResponse,
    GetShopModeResponse,
    ToggleTwoFactorResponse,
    UpdateProfilePayload,
    UpdateProfileResponse,
    UpdateShopModePayload,
    UpdateShopModeResponse,
} from '@/types';
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';

/**
 * Hook to fetch admin general settings
 * @param options - React Query options
 */
export const useGetAdminSettings = (
    options?: Omit<UseQueryOptions<GetAdminSettingsResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<GetAdminSettingsResponse, ApiErrorResponse>({
        queryKey: ['admin-general-settings'],
        queryFn: async () => {
            const res = await Axios.get<GetAdminSettingsResponse>(
                '/apps/deliveries/admin-general-settings'
            );
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        ...options,
    });
};

/**
 * Hook to toggle two-factor authentication
 * @param options - React Query mutation options
 */
export const useToggleTwoFactor = (
    options?: UseMutationOptions<ToggleTwoFactorResponse, ApiErrorResponse, void>
) => {
    const queryClient = useQueryClient();

    return useMutation<ToggleTwoFactorResponse, ApiErrorResponse, void>({
        mutationFn: async () => {
            const res = await Axios.post<ToggleTwoFactorResponse>(
                '/apps/deliveries/admin-general-settings/two-factor'
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin-general-settings'],
                exact: true,
            });
        },
        ...options,
    });
};

/**
 * Hook to change admin password
 * @param options - React Query mutation options
 */
export const useChangePassword = (
    options?: UseMutationOptions<ChangePasswordResponse, ApiErrorResponse, ChangePasswordPayload>
) => {
    return useMutation<ChangePasswordResponse, ApiErrorResponse, ChangePasswordPayload>({
        mutationFn: async (payload: ChangePasswordPayload) => {
            const res = await Axios.post<ChangePasswordResponse>(
                '/apps/deliveries/admin-general-settings/change-password',
                payload
            );
            return res.data;
        },
        ...options,
    });
};

/**
 * Hook to update admin profile
 * @param options - React Query mutation options
 */
export const useUpdateProfile = (
    options?: UseMutationOptions<UpdateProfileResponse, ApiErrorResponse, UpdateProfilePayload>
) => {
    const queryClient = useQueryClient();

    return useMutation<UpdateProfileResponse, ApiErrorResponse, UpdateProfilePayload>({
        mutationFn: async (payload: UpdateProfilePayload) => {
            const formData = buildFormData(payload as unknown as Record<string, unknown>, {
                skipNullish: true,
                skipEmpty: false,
            });

            const res = await Axios.patch<UpdateProfileResponse>(
                '/apps/deliveries/admin-general-settings/profile',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin-general-settings'],
                exact: true,
            });
        },
        ...options,
    });
};

/**
 * Hook to fetch current shop mode
 * @param options - React Query options
 */
export const useGetShopMode = (
    options?: Omit<UseQueryOptions<GetShopModeResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<GetShopModeResponse, ApiErrorResponse>({
        queryKey: ['shop-mode'],
        queryFn: async () => {
            const res = await Axios.get<GetShopModeResponse>(
                '/apps/deliveries/admin-general-settings/shop-mode'
            );
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        ...options,
    });
};

/**
 * Hook to update shop mode
 * @param options - React Query mutation options
 */
export const useUpdateShopMode = (
    options?: UseMutationOptions<UpdateShopModeResponse, ApiErrorResponse, UpdateShopModePayload>
) => {
    const queryClient = useQueryClient();

    return useMutation<UpdateShopModeResponse, ApiErrorResponse, UpdateShopModePayload>({
        mutationFn: async (payload: UpdateShopModePayload) => {
            const res = await Axios.patch<UpdateShopModeResponse>(
                '/apps/deliveries/admin-general-settings/shop-mode',
                payload
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['shop-mode'],
                exact: true,
            });
        },
        ...options,
    });
};
