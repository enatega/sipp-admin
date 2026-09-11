import Axios from '@/config/axios';
import { mapAppType } from '@/lib/app-type-mapper';
// payload will be created in the component; do not import form types here
import { ApiErrorResponse } from '@/types';
import { AppSettings, WebSettings } from '@/types/entities/super-admin/enatega-deliveries/settings';
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

// App Settings Hooks
export function useGetAppSettings(
    appType?: string,
    options?: Omit<UseQueryOptions<AppSettings[] | null, ApiErrorResponse>, 'queryKey' | 'queryFn'>,
) {
    return useQuery<AppSettings[] | null, ApiErrorResponse>({
        queryKey: ['app-settings', appType],
        queryFn: async () => {
            const mapped = mapAppType(appType || '');
            if (!mapped) return null;

            const url = `apps/deliveries/app-settings/${mapped}`;
            const res = await Axios.get<AppSettings>(url);
            return [res.data];
        },
        enabled: !!appType,
        ...options,
    });
}

export function usePatchAppSettings(
    options?: UseMutationOptions<
        AppSettings,
        ApiErrorResponse,
        { appType: string; payload: FormData | Record<string, unknown> }
    >,
) {
    const queryClient = useQueryClient();

    return useMutation<AppSettings, ApiErrorResponse, { appType: string; payload: FormData | Record<string, unknown> }>(
        {
            mutationFn: async ({ appType, payload }: { appType: string; payload: FormData | Record<string, unknown> }) => {
                const mapped = mapAppType(appType || '');
                if (!mapped) throw new Error('Invalid app type');
                const { data } = await Axios.put<{ data: AppSettings }>(`apps/deliveries/app-settings/${mapped}`, payload);
                return data.data;
            },
            onSuccess: (_data, variables) => {
                queryClient.invalidateQueries({
                    queryKey: ['app-settings', variables.appType],
                    exact: false,
                });
                queryClient.invalidateQueries({
                    queryKey: ['app-settings-by-type', variables.appType],
                    exact: false,
                });
            },
            ...options,
        },
    );
}

export function useDeletePromotionalBanner(
    options?: UseMutationOptions<
        { message?: string },
        ApiErrorResponse,
        { appType: string }
    >,
) {
    const queryClient = useQueryClient();

    return useMutation<{ message?: string }, ApiErrorResponse, { appType: string }>(
        {
            mutationFn: async ({ appType }: { appType: string }) => {
                const mapped = mapAppType(appType || '');
                if (!mapped) throw new Error('Invalid app type');

                const { data } = await Axios.delete<{ message?: string }>(
                    `apps/deliveries/app-settings/${mapped}/promotional-banner`,
                );

                return data;
            },
            onSuccess: (_data, variables) => {
                queryClient.invalidateQueries({
                    queryKey: ['app-settings', variables.appType],
                    exact: false,
                });
                queryClient.invalidateQueries({
                    queryKey: ['app-settings-by-type', variables.appType],
                    exact: false,
                });
            },
            ...options,
        },
    );
}

// Web Settings Hooks

export function useGetWebSettings(
    options?: Omit<UseQueryOptions<WebSettings | null, ApiErrorResponse>, 'queryKey' | 'queryFn'>,
) {
    return useQuery<WebSettings | null, ApiErrorResponse>({
        queryKey: ['web-settings'],
        queryFn: async () => {
            const res = await Axios.get<WebSettings>('apps/deliveries/web-settings');
            return res.data;
        },
        ...options,
    });
}

export function usePatchWebSettings(
    options?: UseMutationOptions<
        WebSettings,
        ApiErrorResponse,
        { payload: FormData | Record<string, unknown> }
    >,
) {
    const queryClient = useQueryClient();
    return useMutation<WebSettings, ApiErrorResponse, { payload: FormData | Record<string, unknown> }>(
        {
            mutationFn: async ({ payload }: { payload: FormData | Record<string, unknown> }) => {
                const { data } = await Axios.put<WebSettings>('apps/deliveries/web-settings', payload);
                return data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['web-settings'],
                    exact: false,
                });
            },
            ...options,
        },
    );
}

// Admin Settings Hooks

export function useGetAdminSettings(
    options?: Omit<UseQueryOptions<AppSettings | null, ApiErrorResponse>, 'queryKey' | 'queryFn'>,
) {
    return useQuery<AppSettings | null, ApiErrorResponse>({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            const res = await Axios.get<AppSettings>('apps/deliveries/admin-settings');
            return res.data;
        },
        ...options,
    });
}

export function usePatchAdminSettings(
    options?: UseMutationOptions<
        AppSettings,
        ApiErrorResponse,
        { payload: FormData | Record<string, unknown> }
    >,
) {
    const queryClient = useQueryClient();
    return useMutation<AppSettings, ApiErrorResponse, { payload: FormData | Record<string, unknown> }>(
        {
            mutationFn: async ({ payload }: { payload: FormData | Record<string, unknown> }) => {
                const { data } = await Axios.put<{ data: AppSettings }>('apps/deliveries/admin-settings', payload);
                return data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['admin-settings'],
                    exact: false,
                });
            },
            ...options,
        },
    );
}
