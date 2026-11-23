import Axios from "@/config/axios";
import { useQueryParams } from "@/hooks/use-query-params";
import { ApiErrorResponse, DeleteShopTypeResponse, GetAllShopTypesSimpleResponse, GetShopTypesQueryParams, GetShopTypesResponse, PostShopTypePayload, PostShopTypeResponse, PutShopTypePayload, PutShopTypeResponse } from "@/types";
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

export function useGetAllShopTypesSimple(
    options?: Omit<UseQueryOptions<GetAllShopTypesSimpleResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>,
) {
    return useQuery<GetAllShopTypesSimpleResponse, ApiErrorResponse>({
        queryKey: ['all-shop-types-simple'],
        queryFn: async () => {
            const { data } = await Axios.get<GetAllShopTypesSimpleResponse>(
                '/apps/deliveries/shop-types/all/simple',
            );
            return data;
        },
        ...options,
    });
}

/**
 * Hook to fetch shop types with pagination and filters
 */
export function useGetShopTypes(
    options?: Omit<UseQueryOptions<GetShopTypesResponse, ApiErrorResponse, GetShopTypesResponse, readonly unknown[]>, 'queryKey' | 'queryFn'>
) {
    const { getParam } = useQueryParams();

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const businessType = getParam('businessType') || undefined;
    const status = getParam('status') || undefined;

    const params: GetShopTypesQueryParams = {
        page,
        limit,
        search,
        businessType,
        status,
    };

    const queryKey = ['get-shop-types', params];

    return useQuery<GetShopTypesResponse, ApiErrorResponse>({
        queryKey,
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params.page !== undefined) query.append('page', String(params.page));
            if (params.limit !== undefined) query.append('limit', String(params.limit));
            if (params.search) query.append('search', params.search);
            if (params.businessType) query.append('businessType', params.businessType);
            if (params.status) query.append('active_status', params.status);

            const { data } = await Axios.get<GetShopTypesResponse>(
                `/apps/deliveries/shop-types/by-business-type?${query.toString()}`,
            );
            return data;
        },
        ...options,
    });
}

/**
 * Hook to delete a shop type
 */
export const useDeleteShopType = (
    options?: UseMutationOptions<DeleteShopTypeResponse, ApiErrorResponse, string>
) => {
    const queryClient = useQueryClient();

    return useMutation<DeleteShopTypeResponse, ApiErrorResponse, string>({
        mutationFn: async (id: string) => {
            const res = await Axios.delete<DeleteShopTypeResponse>(
                `/apps/deliveries/shop-types/${id}`
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['get-shop-types'],
                exact: false,
                refetchType: 'all',
            });
        },
        ...options,
    });
};

/**
 * Hook to create a new shop type
 */
export const usePostShopType = (
    options?: UseMutationOptions<PostShopTypeResponse, ApiErrorResponse, PostShopTypePayload>
) => {
    const queryClient = useQueryClient();

    return useMutation<PostShopTypeResponse, ApiErrorResponse, PostShopTypePayload>({
        mutationFn: async (payload: PostShopTypePayload) => {
            const formData = new FormData();
            formData.append('name', payload.name);
            if (payload.image) {
                formData.append('image', payload.image);
            }
            if (payload.description) {
                formData.append('description', payload.description);
            }
            formData.append('is_active', String(payload.is_active));

            const { data } = await Axios.post<PostShopTypeResponse>(
                '/apps/deliveries/shop-types',
                formData
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['get-shop-types'],
                exact: false,
                refetchType: 'all',
            });
            queryClient.invalidateQueries({
                queryKey: ['all-shop-types-simple'],
                exact: false,
                refetchType: 'all',
            });
        },
        ...options,
    });
};

/**
 * Hook to update an existing shop type
 */
export const usePutShopType = (
    options?: UseMutationOptions<PutShopTypeResponse, ApiErrorResponse, PutShopTypePayload>
) => {
    const queryClient = useQueryClient();

    return useMutation<PutShopTypeResponse, ApiErrorResponse, PutShopTypePayload>({
        mutationFn: async (payload) => {
            const formData = new FormData();
            formData.append('shopTypeId', payload.shopTypeId);
            formData.append('name', payload.name);
            if (payload.image instanceof File) {
                formData.append('image', payload.image);
            }
            if (payload.description !== undefined) {
                formData.append('description', payload.description);
            }
            formData.append('is_active', String(payload.is_active));

            const { data } = await Axios.put<PutShopTypeResponse>(
                `/apps/deliveries/shop-types`,
                formData
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['get-shop-types'],
                exact: false,
                refetchType: 'all',
            });
            queryClient.invalidateQueries({
                queryKey: ['all-shop-types-simple'],
                exact: false,
                refetchType: 'all',
            });
        },
        ...options,
    });
};

/**
 * Hook to update only the `is_active` status of a shop type by id
 */
export const useUpdateShopTypeStatus = (
    options?: UseMutationOptions<PutShopTypeResponse, ApiErrorResponse, { shopTypeId: string; is_active: boolean }>
) => {
    const queryClient = useQueryClient();

    return useMutation<PutShopTypeResponse, ApiErrorResponse, { shopTypeId: string; is_active: boolean }>(
        {
            mutationFn: async (payload) => {
                const formData = new FormData();
                formData.append('shopTypeId', payload.shopTypeId);
                formData.append('is_active', String(payload.is_active));

                const { data } = await Axios.put<PutShopTypeResponse>(
                    `/apps/deliveries/shop-types`,
                    formData,
                );
                return data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['get-shop-types'],
                    exact: false,
                    refetchType: 'all',
                });
                queryClient.invalidateQueries({
                    queryKey: ['all-shop-types-simple'],
                    exact: false,
                    refetchType: 'all',
                });
            },
            ...options,
        }
    );
};





