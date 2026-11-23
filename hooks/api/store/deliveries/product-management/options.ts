import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import { useParams } from 'next/navigation';
import {
    ApiErrorResponse,
    CreateOptionPayload,
    CreateOptionResponse,
    DeleteOptionResponse,
    GetOptionResponse,
    GetOptionsDropdownParams,
    GetOptionsDropdownResponse,
    GetOptionsQueryParams,
    GetOptionsResponse,
    UpdateOptionPayload,
    UpdateOptionResponse,
} from '@/types';
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';

export const useGetOptions = (
    options?: Omit<
        UseQueryOptions<
            GetOptionsResponse,
            ApiErrorResponse,
            GetOptionsResponse,
            readonly unknown[]
        >,
        'queryKey' | 'queryFn'
    >,
) => {
    const { getParam } = useQueryParams();
    const { storeId } = useParams() as { storeId?: string };

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;

    const params: GetOptionsQueryParams | null = storeId
        ? {
              store_id: storeId,
              page,
              limit,
              search,
          }
        : null;

    return useQuery<GetOptionsResponse, ApiErrorResponse>({
        queryKey: ['store-product-options', params],
        queryFn: async () => {
            const query = new URLSearchParams();

            query.append('store_id', params!.store_id);
            query.append('page', String(params!.page));
            query.append('limit', String(params!.limit));

            if (params!.search) {
                query.append('search', params!.search);
            }

            const { data } = await Axios.get<GetOptionsResponse>(
                `/apps/deliveries/products/options?${query.toString()}`,
            );

            return data;
        },
        enabled: !!params,
        retry: false,
        ...options,
    });
};

export const useGetOption = (
    optionId: string,
    options?: Omit<
        UseQueryOptions<GetOptionResponse, ApiErrorResponse>,
        'queryKey' | 'queryFn'
    >,
) => {
    const { enabled, ...restOptions } = options ?? {};

    return useQuery<GetOptionResponse, ApiErrorResponse>({
        queryKey: ['store-product-option', optionId],
        queryFn: async () => {
            const { data } = await Axios.get<GetOptionResponse>(
                `/apps/deliveries/products/options/${optionId}`,
            );

            return data;
        },
        enabled: !!optionId && (enabled ?? true),
        retry: false,
        ...restOptions,
    });
};

export const useGetOptionsDropdown = (
    params: GetOptionsDropdownParams | null,
    options?: Omit<
        UseQueryOptions<
            GetOptionsDropdownResponse,
            ApiErrorResponse,
            GetOptionsDropdownResponse,
            readonly unknown[]
        >,
        'queryKey' | 'queryFn'
    >,
) => {
    return useQuery<GetOptionsDropdownResponse, ApiErrorResponse>({
        queryKey: ['store-product-options-dropdown', params],
        queryFn: async () => {
            const query = new URLSearchParams();
            query.append('store_id', params!.store_id);
            query.append('offset', String(params!.offset));
            query.append('limit', String(params!.limit));
            if (params!.search) {
                query.append('search', params!.search);
            }

            const { data } = await Axios.get<GetOptionsDropdownResponse>(
                `/apps/deliveries/products/options/dropdown/store?${query.toString()}`,
            );

            return data;
        },
        enabled: !!params,
        retry: false,
        ...options,
    });
};

export const useCreateOption = (
    options?: UseMutationOptions<
        CreateOptionResponse,
        ApiErrorResponse,
        CreateOptionPayload
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation<CreateOptionResponse, ApiErrorResponse, CreateOptionPayload>(
        {
            ...options,
            mutationFn: async (payload) => {
                const { data } = await Axios.post<CreateOptionResponse>(
                    '/apps/deliveries/products/options',
                    payload,
                );

                return data;
            },
            retry: false,
            onSuccess: (...args) => {
                queryClient.invalidateQueries({
                    queryKey: ['store-product-options'],
                    exact: false,
                    refetchType: 'active',
                });
                queryClient.invalidateQueries({
                    queryKey: ['store-product-options-dropdown'],
                    exact: false,
                    refetchType: 'active',
                });
                options?.onSuccess?.(...args);
            },
        },
    );
};

export const useUpdateOption = (
    options?: UseMutationOptions<
        UpdateOptionResponse,
        ApiErrorResponse,
        UpdateOptionPayload
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation<UpdateOptionResponse, ApiErrorResponse, UpdateOptionPayload>(
        {
            ...options,
            mutationFn: async ({ id, ...payload }) => {
                const { data } = await Axios.put<UpdateOptionResponse>(
                    `/apps/deliveries/products/options/${id}`,
                    payload,
                );

                return data;
            },
            retry: false,
            onSuccess: (data, variables, onMutateResult, context) => {
                queryClient.invalidateQueries({
                    queryKey: ['store-product-options'],
                    exact: false,
                    refetchType: 'active',
                });
                queryClient.invalidateQueries({
                    queryKey: ['store-product-option', variables.id],
                    exact: true,
                });
                options?.onSuccess?.(data, variables, onMutateResult, context);
            },
        },
    );
};

export const useDeleteOption = (
    options?: UseMutationOptions<DeleteOptionResponse, ApiErrorResponse, string>,
) => {
    const queryClient = useQueryClient();

    return useMutation<DeleteOptionResponse, ApiErrorResponse, string>({
        ...options,
        mutationFn: async (optionId) => {
            const { data } = await Axios.delete<DeleteOptionResponse>(
                `/apps/deliveries/products/options/${optionId}`,
            );

            return data;
        },
        retry: false,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({
                queryKey: ['store-product-options'],
                exact: false,
                refetchType: 'active',
            });
            options?.onSuccess?.(...args);
        },
    });
};
