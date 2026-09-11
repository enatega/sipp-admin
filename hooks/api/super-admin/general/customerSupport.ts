import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import { ApiErrorResponse } from '@/types';
import {
    GetCustomerSupportQueryParams,
    GetCustomerSupportResponse,
    GetCustomerSupportTicketMessagesByIdResponse,
    SupportChatSendMessagePayload,
    SupportChatSendMessageResponse,
    SupportModule,
    UpdateTicketStatusPayload,
    UpdateTicketStatusResponse
} from '@/types/api/super-admin/general/customerSupport.api';
import { Priority, Status, TicketType } from '@/types/entities/super-admin/general/customer-support';
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';



interface SupportHookConfig {
    endpoint: string;
    queryKey: string;
}

export const useSupportChatBase = (
    config: SupportHookConfig,
    options?: Omit<
        UseQueryOptions<
            GetCustomerSupportResponse,
            ApiErrorResponse,
            GetCustomerSupportResponse,
            readonly unknown[]
        >,
        'queryKey' | 'queryFn'
    >
) => {
    const { getParam, getAllParams } = useQueryParams();

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const offset = (page - 1) * limit;

    const allParams = getAllParams();

    const ticketTypeParam = allParams['ticketType'];

    const ticketTypes = ticketTypeParam
        ? ((Array.isArray(ticketTypeParam)
            ? ticketTypeParam
            : [ticketTypeParam]) as TicketType[])
        : undefined;

    const status = getParam('status') as Status | undefined;
    const priority = getParam('priority') as Priority | undefined;
    const search = getParam('search') || undefined;
    const from = getParam('from') || undefined;
    const to = getParam('to') || undefined;

    const params: GetCustomerSupportQueryParams = {
        offset,
        limit,
        ticketType: ticketTypes,
        status,
        priority,
        search,
        from,
        to,
    };

    const queryKey = [config.queryKey, params] as const;

    return useQuery<GetCustomerSupportResponse, ApiErrorResponse>({
        queryKey,

        queryFn: async () => {
            const query = new URLSearchParams();

            if (params.offset !== undefined) {
                query.append('offset', String(params.offset));
            }

            if (params.limit !== undefined) {
                query.append('limit', String(params.limit));
            }

            if (params.status) {
                query.append('status', params.status);
            }

            if (params.priority) {
                query.append('priority', params.priority);
            }

            if (params.search) {
                query.append('search', params.search);
            }

            if (params.from) {
                query.append('from', params.from);
            }

            if (params.to) {
                query.append('to', params.to);
            }

            if (params.ticketType?.length) {
                params.ticketType.forEach((type) => {
                    query.append('ticketType', type);
                });
            }

            const apiUrl = `${config.endpoint}?${query.toString()}`;

            const res = await Axios.get<GetCustomerSupportResponse>(apiUrl);

            return res.data;
        },

        retry: false,
        ...options,
    });
};

const supportMessagesEndpointMap: Record<SupportModule, string> = {
    deliveries: '/deliveries/support-chat/messages',
};

export const useGetSupportChatMessagesById = (
    module: SupportModule,
    id: string,
    options?: Omit<
        UseQueryOptions<
            GetCustomerSupportTicketMessagesByIdResponse,
            ApiErrorResponse,
            GetCustomerSupportTicketMessagesByIdResponse,
            readonly [string, SupportModule, string]
        >,
        'queryKey' | 'queryFn'
    >
) => {
    return useQuery<
        GetCustomerSupportTicketMessagesByIdResponse,
        ApiErrorResponse,
        GetCustomerSupportTicketMessagesByIdResponse,
        readonly [string, SupportModule, string]
    >({
        queryKey: [
            'get-support-chat-messages-by-id',
            module,
            id,
        ] as const,

        queryFn: async () => {
            const endpoint =
                supportMessagesEndpointMap[module];

            const res =
                await Axios.get<GetCustomerSupportTicketMessagesByIdResponse>(
                    `${endpoint}/${id}`
                );

            return res.data;
        },

        enabled: !!module && !!id,

        retry: false,

        ...options,
    });
};

const updateStatusEndpointMap: Record<SupportModule, string> = {
    deliveries: '/deliveries/support-chat/update-status',
};

export const useUpdateSupportTicketStatus = (
    module: SupportModule,
    options?: UseMutationOptions<
        UpdateTicketStatusResponse,
        ApiErrorResponse,
        UpdateTicketStatusPayload
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        UpdateTicketStatusResponse,
        ApiErrorResponse,
        UpdateTicketStatusPayload
    >({
        mutationFn: async (data) => {
            const endpoint = updateStatusEndpointMap[module];

            const res = await Axios.patch<UpdateTicketStatusResponse>(
                endpoint,
                data
            );

            return res.data;
        },

        onSuccess: (...args) => {
            queryClient.invalidateQueries({
                queryKey: [
                    'get-support-chat-messages-by-id',
                    module,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    'get-support-chat',
                    module,
                ],
            });

            options?.onSuccess?.(...args);
        },

        ...options,
    });
};


const sendMessageEndpointMap: Record<SupportModule, string> = {
    deliveries: '/deliveries/support-chat/send',
};

export const useSendSupportChatMessage = (
    module: SupportModule,
    options?: UseMutationOptions<
        SupportChatSendMessageResponse,
        ApiErrorResponse,
        SupportChatSendMessagePayload
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        SupportChatSendMessageResponse,
        ApiErrorResponse,
        SupportChatSendMessagePayload
    >({
        mutationFn: async (data) => {
            const endpoint = sendMessageEndpointMap[module];

            const res = await Axios.post<
                SupportChatSendMessageResponse
            >(endpoint, data);

            return res.data;
        },

        onSuccess: (...args) => {

            queryClient.invalidateQueries({
                queryKey: [
                    'get-support-chat-messages-by-id',
                    module,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    'get-support-chat',
                    module,
                ],
            });

            options?.onSuccess?.(...args);
        },

        ...options,
    });
};
