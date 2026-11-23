import Axios from '@/config/axios';
import { ApiErrorResponse } from '@/types';
import { CreateStaticPagePayload, CreateStaticPageResponse, DeleteStaticPagePayload, DeleteStaticPageResponse, GetStaticPageResponse, ToggleStaticPagePublishPayload, ToggleStaticPagePublishResponse, UpdateStaticPagePayload, UpdateStaticPageResponse } from '@/types/api/super-admin/enatega-deliveries/static-page.api';
import { useMutation, UseMutationOptions, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useApiQuery } from '../../use-api-query';

type GetStaticPagesOptions = Omit<
    UseQueryOptions<GetStaticPageResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
>;
export function useGetStaticPages(options?: GetStaticPagesOptions) {
    return useApiQuery<GetStaticPageResponse>(
        '/apps/deliveries/static-pages',
        options,
        {
            mapper: (params) => {
                const { page, limit, search } = params;
                return {
                    page,
                    limit,
                    search,
                    include_unpublished: true,
                };
            },
        }
    );
}


/**
 * Hook to toggle publish status of a static page
 * @param options - React Query mutation options
 * @returns Mutation result for toggling static page publish status
 */
export const useToggleStaticPagePublish = (
    options?: UseMutationOptions<
        ToggleStaticPagePublishResponse,
        ApiErrorResponse,
        ToggleStaticPagePublishPayload
    >
) => {
    const queryClient = useQueryClient();
    return useMutation<
        ToggleStaticPagePublishResponse,
        ApiErrorResponse,
        ToggleStaticPagePublishPayload
    >({
        mutationFn: async (payload) => {
            const { data } = await Axios.patch<ToggleStaticPagePublishResponse>(
                `/apps/deliveries/static-pages/${payload.id}/toggle-publish`
            );
            return data;
        },
        onSuccess: (data, variables, context, meta) => {
            queryClient.invalidateQueries({ queryKey: ['/apps/deliveries/static-pages'] });

            options?.onSuccess?.(data, variables, context, meta);
        },
        ...options,
    });
};


/**
 * Hook to delete a static page
 * @param options - React Query mutation options
 * @returns Mutation result for deleting static page
 */
export const useDeleteStaticPage = (
    options?: UseMutationOptions<
        DeleteStaticPageResponse,
        ApiErrorResponse,
        DeleteStaticPagePayload
    >
) => {
    const queryClient = useQueryClient();
    return useMutation<
        DeleteStaticPageResponse,
        ApiErrorResponse,
        DeleteStaticPagePayload
    >({
        mutationFn: async (payload) => {
            const { data } = await Axios.delete<DeleteStaticPageResponse>(
                `/apps/deliveries/static-pages/${payload.id}`
            );
            return data;
        },
        onSuccess: (data, variables, context, meta) => {
            queryClient.invalidateQueries({ queryKey: ['/apps/deliveries/static-pages'] });

            options?.onSuccess?.(data, variables, context, meta);
        },
        ...options,
    });
};


/**
 * Hook to create a static page
 * @param options - React Query mutation options
 * @returns Mutation result for creating static page
 */
export const useCreateStaticPage = (
    options?: UseMutationOptions<
        CreateStaticPageResponse,
        ApiErrorResponse,
        CreateStaticPagePayload
    >
) => {
    const queryClient = useQueryClient();
    return useMutation<
        CreateStaticPageResponse,
        ApiErrorResponse,
        CreateStaticPagePayload
    >({
        mutationFn: async (payload) => {
            // Use FormData for file uploads
            const formData = new FormData();
            formData.append('page_name', payload.page_name);
            formData.append('slug', payload.slug);
            formData.append('content', payload.content);
            formData.append('is_published', String(payload.is_published));

            if (payload.banner_image) {
                formData.append('banner_image', payload.banner_image);
            }

            const { data } = await Axios.post<CreateStaticPageResponse>(
                '/apps/deliveries/static-pages',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return data;
        },
        onSuccess: (data, variables, context, meta) => {
            queryClient.invalidateQueries({ queryKey: ['/apps/deliveries/static-pages'] });

            options?.onSuccess?.(data, variables, context, meta);
        },
        ...options,
    });
};



/**
 * Hook to update an existing static page
 * @param options - React Query mutation options
 * @returns Mutation result for updating a static page
 */
export const useUpdateStaticPage = (
    options?: UseMutationOptions<
        UpdateStaticPageResponse,
        ApiErrorResponse,
        UpdateStaticPagePayload
    >
) => {
    const queryClient = useQueryClient();
    return useMutation<
        UpdateStaticPageResponse,
        ApiErrorResponse,
        UpdateStaticPagePayload
    >({
        mutationFn: async (payload) => {
            if (!payload.id) {
                throw new Error('Static page ID is required');
            }

            const formData = new FormData();

            if (payload.page_name !== undefined) {
                formData.append('page_name', payload.page_name);
            }
            if (payload.slug !== undefined) {
                formData.append('slug', payload.slug);
            }
            if (payload.content !== undefined) {
                formData.append('content', payload.content);
            }
            if (payload.is_published !== undefined) {
                formData.append('is_published', String(payload.is_published));
            }
            if (payload.banner_image) {
                formData.append('banner_image', payload.banner_image);
            }

            const { data } = await Axios.put<UpdateStaticPageResponse>(
                `/apps/deliveries/static-pages/${payload.id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return data;
        },
        onSuccess: (data, variables, context, meta) => {
            queryClient.invalidateQueries({ queryKey: ['/apps/deliveries/static-pages'] });
            options?.onSuccess?.(data, variables, context, meta);
        },
        ...options,
    });
};