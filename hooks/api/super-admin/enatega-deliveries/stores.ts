import Axios from '@/config/axios';
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';
import { useQueryParams } from '@/hooks/use-query-params';
import {
    ApiErrorResponse,
    GetDeliveryStoresResponse,
    GetSimpleStoresResponse,
    GetStoreDetailResponse,
    GetStoresQueryParams,
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
 * Hook to fetch all delivery stores with pagination and filters
 * @param options - React Query options
 */
export const useGetAllDeliveryStores = (
    options?: Omit<UseQueryOptions<GetDeliveryStoresResponse, ApiErrorResponse, GetDeliveryStoresResponse, readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
    const { getParam } = useQueryParams();
    const modeScope = useDeliveriesAdminModeScope();

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const statusParam = getParam('status');
    const status = statusParam === 'all' || !statusParam ? undefined : statusParam;
    const minRating = getParam('rating') || undefined;
    const shopTypeId = getParam('shopType') || undefined;
    const zoneId = getParam('zoneId') || undefined;
    const startDate = getParam('startDate') || undefined;
    const endDate = getParam('endDate') || undefined;

    const params: GetStoresQueryParams = useMemo(() => ({
        page,
        limit,
        search,
        status,
        minRating,
        shopTypeId,
        zoneId,
        startDate,
        endDate,
        modeScope,
    }), [endDate, limit, minRating, modeScope, page, search, shopTypeId, startDate, status, zoneId]);

    const queryKey = ['get-delivery-stores', params];

    const fetchStores = useCallback(async (
        requestParams: GetStoresQueryParams
    ): Promise<GetDeliveryStoresResponse> => {
        const query = new URLSearchParams();
        if (requestParams.page !== undefined) query.append('page', String(requestParams.page));
        if (requestParams.limit !== undefined) query.append('limit', String(requestParams.limit));
        if (requestParams.search) query.append('search', requestParams.search);
        if (requestParams.status && requestParams.status !== "all") query.append('status', requestParams.status);
        if (requestParams.minRating) query.append('minRating', requestParams.minRating);
        if (requestParams.shopTypeId) query.append('shopTypeId', requestParams.shopTypeId);
        if (requestParams.zoneId) query.append('zoneId', requestParams.zoneId);
        if (requestParams.startDate) query.append('startDate', requestParams.startDate);
        if (requestParams.endDate) query.append('endDate', requestParams.endDate);
        if ((requestParams as typeof requestParams & { modeScope?: string }).modeScope) {
            query.append('modeScope', (requestParams as typeof requestParams & { modeScope?: string }).modeScope as string);
        }

        const apiUrl = `/apps/deliveries/stores?${query.toString()}`;
        const res = await Axios.get<GetDeliveryStoresResponse>(apiUrl);
        return res.data;
    }, []);

    return useQuery<GetDeliveryStoresResponse, ApiErrorResponse>({
        queryKey,
        queryFn: () => fetchStores(params),
        placeholderData: (previous) => previous,
        ...options,
    });
};


/**
 * Hook to fetch all simple delivery stores
 * @param options - React Query options
 */
export const useGetAllSimpleStores = (
    options?: Omit<
        UseQueryOptions<GetSimpleStoresResponse[], ApiErrorResponse, GetSimpleStoresResponse[], readonly unknown[]>,
        'queryKey' | 'queryFn'
    >
) => {
    const queryKey = ['get-all-simple-stores'];
    const modeScope = useDeliveriesAdminModeScope();

    return useQuery<GetSimpleStoresResponse[], ApiErrorResponse>({
        queryKey: [...queryKey, modeScope ?? null],
        queryFn: async () => {
            const apiUrl = modeScope
                ? `/apps/deliveries/stores/simple-stores?modeScope=${modeScope}`
                : '/apps/deliveries/stores/simple-stores';
            const res = await Axios.get<GetSimpleStoresResponse[]>(apiUrl);
            return res.data;
        },
        ...options,
    });
};


/**
 * Hook to toggle store availability
 * @param options - React Query mutation options
 */
export const useToggleStoreAvailability = (
    options?: UseMutationOptions<unknown, ApiErrorResponse, string>
) => {
    const queryClient = useQueryClient();

    return useMutation<unknown, ApiErrorResponse, string>({
        mutationFn: async (storeId: string) => {
            const res = await Axios.patch(
                `/apps/deliveries/stores/${storeId}/toggle-availability`
            );
            return res.data;
        },
        onSuccess: () => {
            // Invalidate all queries that start with 'get-delivery-stores'
            queryClient.invalidateQueries({
                queryKey: ["get-store-detail"],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ['get-delivery-stores'],
                exact: false,
                // refetchType: 'active',
            });
        },
        ...options,
    });
};

/**
 * Hook to toggle store block status
 * @param options - React Query mutation options
 */
export const useToggleStoreBlock = (
    options?: UseMutationOptions<{ message: string; isBlocked: boolean }, ApiErrorResponse, string>
) => {
    const queryClient = useQueryClient();

    return useMutation<{ message: string; isBlocked: boolean }, ApiErrorResponse, string>({
        mutationFn: async (storeId: string) => {
            const res = await Axios.patch<{ message: string; isBlocked: boolean }>(
                `/apps/deliveries/stores/${storeId}/toggle-block`
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["get-store-detail"],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ['get-delivery-stores'],
                exact: false,
                refetchType: 'active',
            });
        },
        ...options,
    });
};

/**
 * Hook to approve a store
 * @param options - React Query mutation options
 */
export const useApproveStore = (
    options?: UseMutationOptions<{ message: string; status: string }, ApiErrorResponse, string>
) => {
    const queryClient = useQueryClient();

    return useMutation<{ message: string; status: string }, ApiErrorResponse, string>({
        mutationFn: async (storeId: string) => {
            const res = await Axios.patch<{ message: string; status: string }>(
                `/apps/deliveries/stores/${storeId}/approve`
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["get-store-detail"],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ['get-delivery-stores'],
                exact: false,
                refetchType: 'active',
            });
            queryClient.invalidateQueries({
                queryKey: ['get-delivery-vendors'],
                exact: false,
                refetchType: 'all',
            });
            queryClient.invalidateQueries({
                queryKey: ['get-vendor-detail'],
                exact: false,
                refetchType: 'all',
            });
            queryClient.invalidateQueries({
                queryKey: ['get-all-vendors-simple'],
                exact: false,
                refetchType: 'all',
            });
        },
        ...options,
    });
};

/**
 * Hook to reject a store
 * @param options - React Query mutation options
 */
export const useRejectStore = (
    options?: UseMutationOptions<{ message: string; status: string }, ApiErrorResponse, { storeId: string; rejectionReason: string }>
) => {
    const queryClient = useQueryClient();

    return useMutation<{ message: string; status: string }, ApiErrorResponse, { storeId: string; rejectionReason: string }>({
        mutationFn: async ({ storeId, rejectionReason }) => {
            const res = await Axios.patch<{ message: string; status: string }>(
                `/apps/deliveries/stores/${storeId}/reject`,
                { rejectionReason }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["get-store-detail"],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ['get-delivery-stores'],
                exact: false,
                refetchType: 'active',
            });
        },
        ...options,
    });
};

/**
 * Hook to delete a store
 * @param options - React Query mutation options
 */
export const useDeleteStore = (
    options?: UseMutationOptions<{ message: string; success: boolean }, ApiErrorResponse, string>
) => {
    const queryClient = useQueryClient();

    return useMutation<{ message: string; success: boolean }, ApiErrorResponse, string>({
        mutationFn: async (storeId: string) => {
            const res = await Axios.delete<{ message: string; success: boolean }>(
                `/apps/deliveries/stores/${storeId}`
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["get-store-detail"],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ['get-delivery-stores'],
                exact: false,
                refetchType: 'active',
            });
            queryClient.invalidateQueries({
                queryKey: ['get-delivery-vendors'],
                exact: false,
                refetchType: 'all',
            });
            queryClient.invalidateQueries({
                queryKey: ['get-vendor-detail'],
                exact: false,
                refetchType: 'all',
            });
            queryClient.invalidateQueries({
                queryKey: ['get-all-vendors-simple'],
                exact: false,
                refetchType: 'all',
            });
        },
        ...options,
    });
};

/**
 * Hook to create a new store
 * @param options - React Query mutation options
 */
export const useCreateStore = (
    options?: UseMutationOptions<{ message: string }, ApiErrorResponse, FormData>
) => {
    const queryClient = useQueryClient();

    return useMutation<{ message: string }, ApiErrorResponse, FormData>({
        ...options,
        mutationFn: async (formData: FormData) => {
            const res = await Axios.post<{ message: string }>(
                `/apps/deliveries/stores/main-store`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return res.data;
        },
        retry: false, // Disable retries
        onSuccess: (...args) => {
            void queryClient.invalidateQueries({
                queryKey: ['get-all-simple-stores'],
                exact: false,
                refetchType: 'none',
            });
            void queryClient.invalidateQueries({
                queryKey: ["get-store-detail"],
                exact: false,
                refetchType: 'none',
            });
            void queryClient.invalidateQueries({
                queryKey: ['get-delivery-stores'],
                exact: false,
                refetchType: 'none',
            });
            void queryClient.refetchQueries({
                queryKey: ['get-delivery-stores'],
                exact: false,
                type: 'all',
            });

            options?.onSuccess?.(...args);
        },
        onError: (...args) => {
            options?.onError?.(...args);
        },
        onSettled: (...args) => {
            options?.onSettled?.(...args);
        },
    });
};

/**
 * Hook to update an existing store
 * @param options - React Query mutation options
 */
export const useUpdateStore = (
    options?: UseMutationOptions<{ message: string }, ApiErrorResponse, { storeId: string; formData: FormData }>
) => {
    const queryClient = useQueryClient();

    return useMutation<{ message: string }, ApiErrorResponse, { storeId: string; formData: FormData }>({
        ...options,
        mutationFn: async ({ storeId, formData }) => {
            const res = await Axios.patch<{ message: string }>(
                `/apps/deliveries/stores/${storeId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return res.data;
        },
        retry: false,
        onSuccess: (...args) => {
            void queryClient.invalidateQueries({
                queryKey: ["get-store-detail"],
                exact: false,
            });
            void queryClient.invalidateQueries({
                queryKey: ['get-delivery-stores'],
                exact: false,
                refetchType: 'active',
            });
            options?.onSuccess?.(...args);
        },
        onError: (...args) => {
            options?.onError?.(...args);
        },
        onSettled: (...args) => {
            options?.onSettled?.(...args);
        },
    });
};

/**
 * Hook to fetch single store details
 * @param storeId - Store ID
 * @param options - React Query options
 */
export const useGetStoreDetail = (
    storeId: string,
    options?: Omit<UseQueryOptions<GetStoreDetailResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<GetStoreDetailResponse, ApiErrorResponse>({
        queryKey: ['get-store-detail', storeId],
        queryFn: async () => {
            const res = await Axios.get<GetStoreDetailResponse>(
                `/apps/deliveries/stores/${storeId}`
            );
            return res.data;
        },
        enabled: !!storeId,
        ...options,
    });
};
