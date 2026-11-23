import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  AudiencePreview,
  AudiencePreviewPayload,
  AudienceUser,
  DeleteNotificationResponse,
  GetNotificationByIdResponse,
  GetNotificationsQueryParams,
  GetNotificationsResponse,
  NotificationRecord,
  ResendNotificationResponse,
  SendNotificationPayload,
  SendNotificationResponse,
  SortByField,
  SortOrder,
} from '@/types';
import {
  keepPreviousData,
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
 * Hook to preview who an audience would reach, without sending anything
 */
export const useAudiencePreview = (
  payload: AudiencePreviewPayload,
  enabled: boolean,
) => {
  return useQuery<AudiencePreview, ApiErrorResponse>({
    queryKey: ['notification-audience-preview', payload],
    queryFn: async () => {
      const res = await Axios.post<AudiencePreview>(
        '/admin/notifications/audience/preview',
        payload,
      );
      return res.data;
    },
    enabled,
    retry: false,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook to search users to pick as individual notification recipients.
 * By default only users who can receive a push are returned.
 */
export const useSearchAudienceUsers = (search: string, pushOnly = true) => {
  const term = search.trim();

  return useQuery<AudienceUser[], ApiErrorResponse>({
    queryKey: ['notification-audience-users', term, pushOnly],
    // `signal` cancels the in-flight request once the term has moved on.
    queryFn: async ({ signal }) => {
      const res = await Axios.get<AudienceUser[]>(
        '/admin/notifications/audience/users',
        { params: { search: term, pushOnly }, signal },
      );
      return res.data;
    },
    enabled: term.length >= 2,
    retry: false,
    staleTime: 30_000,
    // Keep the previous results on screen while the next search is in flight.
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook to follow a just-sent notification: delivery receipts arrive for a few
 * minutes after the send and are tallied on the stored record.
 */
/** After this long without a receipt, a delivery is reported as unconfirmed. */
export const RECEIPT_WINDOW_MS = 20 * 60 * 1000;

export const useNotificationDelivery = (id: string | undefined, active: boolean) => {
  return useQuery<NotificationRecord, ApiErrorResponse>({
    queryKey: ['notification-delivery', id],
    queryFn: async () => {
      const res = await Axios.get<NotificationRecord>(`/admin/notifications/${id}`);
      return res.data;
    },
    enabled: !!id && active,
    retry: false,
    staleTime: 0,
    refetchInterval: (query) => {
      const metadata = query.state.data?.metadata;
      const stats = metadata?.receiptStats;
      if (stats && stats.delivered + stats.failed >= stats.expected) return false;
      const sentAt = metadata?.sendStats?.sentAt;
      const elapsed = sentAt ? Date.now() - Date.parse(sentAt) : 0;
      if (elapsed > RECEIPT_WINDOW_MS) return false;
      // Receipts mostly land in the first minute; poll quickly while the admin watches.
      return elapsed < 2 * 60 * 1000 ? 2_000 : 5_000;
    },
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
