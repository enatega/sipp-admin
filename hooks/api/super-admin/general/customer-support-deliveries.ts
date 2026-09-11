import { UseQueryOptions } from '@tanstack/react-query';

import { ApiErrorResponse } from '@/types';

import {
    GetCustomerSupportResponse,
} from '@/types/api/super-admin/general/customerSupport.api';
import { useSupportChatBase } from './customerSupport';


export const useGetDeliverySupport = (
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
    return useSupportChatBase(
        {
            endpoint: '/deliveries/support-chat/all',
            queryKey: 'get-delivery-support-chat',
        },
        options
    );
};