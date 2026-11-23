import Axios from '@/config/axios';
import { getStorePath } from '@/lib/store';
import { getAdminProfiles, getStoreProfileId } from '@/lib/user';

/** Fired to silence the new-order ring, e.g. when the store opens its notifications. */
export const STORE_ORDER_SOUND_STOP_EVENT = 'sipp:store-order-sound-stop';

/** Preparation times offered when a store accepts an order (same list as the store app). */
export const PREPARING_TIME_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90] as const;

export const storeNotificationKeys = {
  all: ['store-notifications'] as const,
  count: ['store-notifications', 'count'] as const,
  list: (page: number) => ['store-notifications', 'list', page] as const,
  newOrders: (storeId: string) => ['store-new-orders', storeId] as const,
};

export interface StoreInboxItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  deep_link: string | null;
  data: { type?: string; orderId?: string } | null;
}

export interface StoreInboxPage {
  data: StoreInboxItem[];
  total: number;
  page: number;
  limit: number;
}

export interface StoreNewOrdersSnapshot {
  total: number;
  latest: { orderId: string; customerName?: string | null; dateTime?: string | null } | null;
}

/**
 * The inbox belongs to the signed-in user, so store notifications are only
 * shown when that user is the store itself (not an admin or vendor viewing it).
 */
export function isStoreOwnerSession(storeId?: string | null): boolean {
  if (!storeId || typeof window === 'undefined') return false;
  return getStoreProfileId(getAdminProfiles()) === storeId;
}

/** Store inbox items link to `/orders/:id`; map them onto the store dashboard. */
export function storeNotificationHref(storeId: string, item: Pick<StoreInboxItem, 'data' | 'deep_link'>): string | null {
  const orderId = item.data?.orderId
    ?? item.deep_link?.match(/^\/orders\/([0-9a-f-]{36})$/i)?.[1];
  return orderId ? getStorePath(storeId, `/orders/${orderId}`) : null;
}

const base = '/apps/deliveries/users-notifications';

export const storeInboxApi = {
  list: async (page = 1, limit = 20) =>
    (await Axios.get<StoreInboxPage>(`${base}/user/me`, { params: { page, limit } })).data,
  count: async () =>
    (await Axios.get<{ unreadCount: number }>(`${base}/count-unread`)).data.unreadCount ?? 0,
  read: async (id: string) => Axios.patch(`${base}/mark-read/${id}`),
  readAll: async () => Axios.patch(`${base}/mark-all-read`),
};

/** Orders still waiting for the store to accept or reject them (the app's "New" tab). */
export async function fetchStoreNewOrders(storeId: string): Promise<StoreNewOrdersSnapshot> {
  const { data } = await Axios.get<{
    total?: number;
    data?: Array<{ orderId: string; customerName?: string | null; dateTime?: string | null }>;
  }>(`/apps/deliveries/store/orders/${storeId}`, { params: { status: 'new', page: 1, limit: 1 } });
  const latest = data?.data?.[0] ?? null;
  return { total: Number(data?.total ?? 0), latest };
}
