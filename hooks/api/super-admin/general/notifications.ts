import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  DeleteNotificationResponse,
  GetNotificationByIdResponse,
  GetNotificationsQueryParams,
  GetNotificationsResponse,
  ResendNotificationResponse,
  SendNotificationPayload,
  SendNotificationResponse,
  SortByField,
  SortOrder,
} from '@/types';
import {
  QueryClient,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

const NOTIFICATIONS_QUERY_KEY = ['get-notifications'] as const;

const refreshNotificationsQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === NOTIFICATIONS_QUERY_KEY[0],
  });

  await queryClient.refetchQueries({
    predicate: (query) => query.queryKey[0] === NOTIFICATIONS_QUERY_KEY[0],
    type: 'active',
  });
};

/**
 * Hook to get all notifications with filters and sorting
 */
export const useGetNotifications = (
  options?: Omit<
    UseQueryOptions<
      GetNotificationsResponse,
      ApiErrorResponse,
      GetNotificationsResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const offset = (page - 1) * limit;
  const sentTo = getParam('sentTo') || undefined;
  const search = getParam('search') || undefined;
  const startDate = getParam('startDate') || undefined;
  const endDate = getParam('endDate') || undefined;
  const sortBy = (getParam('sortBy') as SortByField) || undefined;
  const sortOrder = (getParam('sortOrder') as SortOrder) || undefined;

  const params: GetNotificationsQueryParams = {
    page,
    limit,
    offset,
    sentTo,
    search,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  };

  const queryKey = [...NOTIFICATIONS_QUERY_KEY, params];

  return useQuery<GetNotificationsResponse, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.append('page', String(params.page));
      if (params.limit !== undefined)
        query.append('limit', String(params.limit));
      if (params.sentTo) {
        params.sentTo.split(",").forEach((item) => {
          if (item.length > 0) {
            query.append('sentTo', item);
          }
        })
      }
      if (params.search) query.append('search', params.search);
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);

      const apiUrl = `/admin/notifications?${query.toString()}`;
      const res = await Axios.get<GetNotificationsResponse>(apiUrl);
      return res.data;
    },
    retry: false,
    ...options,
  });
};

/**
 * Hook to get a notification by ID (for resend prefill)
 */
export const useGetNotificationById = (
  id: string,
  options?: UseQueryOptions<
    GetNotificationByIdResponse,
    ApiErrorResponse,
    GetNotificationByIdResponse,
    readonly [string, string]
  >,
) => {
  return useQuery<
    GetNotificationByIdResponse,
    ApiErrorResponse,
    GetNotificationByIdResponse,
    readonly [string, string]
  >({
    queryKey: ['get-notification-by-id', id] as const,
    queryFn: async () => {
      const res = await Axios.get<GetNotificationByIdResponse>(
        `/admin/notifications/${id}`,
      );
      return res.data;
    },
    enabled: !!id,
    retry: false,
    ...options,
  });
};

/**
 * Hook to send a new notification
 */
export const useSendNotification = (
  options?: UseMutationOptions<
    SendNotificationResponse,
    ApiErrorResponse,
    SendNotificationPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    SendNotificationResponse,
    ApiErrorResponse,
    SendNotificationPayload
  >({
    mutationFn: async (payload) => {
      const res = await Axios.post<SendNotificationResponse>(
        '/admin/notifications/send',
        payload,
      );
      return res.data;
    },
    onSuccess: async (...args) => {
      await refreshNotificationsQueries(queryClient);
      await options?.onSuccess?.(...args);
    },
    ...options,
  });
};

/**
 * Hook to resend an existing notification
 */
export const useResendNotification = (
  options?: UseMutationOptions<
    ResendNotificationResponse,
    ApiErrorResponse,
    string
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<ResendNotificationResponse, ApiErrorResponse, string>({
    mutationFn: async (id: string) => {
      const res = await Axios.post<ResendNotificationResponse>(
        `/admin/notifications/resend/${id}`,
      );
      return res.data;
    },
    onSuccess: async (...args) => {
      await refreshNotificationsQueries(queryClient);
      await options?.onSuccess?.(...args);
    },
    ...options,
  });
};

/**
 * Hook to delete a notification
 */
export const useDeleteNotification = (
  options?: UseMutationOptions<
    DeleteNotificationResponse,
    ApiErrorResponse,
    string
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteNotificationResponse, ApiErrorResponse, string>({
    mutationFn: async (id: string) => {
      const res = await Axios.delete<DeleteNotificationResponse>(
        `/admin/notifications/${id}`,
      );
      return res.data;
    },
    onSuccess: async (...args) => {
      await refreshNotificationsQueries(queryClient);
      await options?.onSuccess?.(...args);
    },
    ...options,
  });
};
