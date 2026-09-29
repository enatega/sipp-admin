import Axios from '@/config/axios';

export interface AdminInboxItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  deep_link: string | null;
  data: { type?: string; entityId?: string; requiredPermission?: string } | null;
}

export interface AdminInboxPage {
  data: AdminInboxItem[];
  total: number;
  page: number;
  limit: number;
}

const base = '/apps/deliveries/admin/operational-notifications';

export const adminInboxApi = {
  list: async (page = 1, unread = false) =>
    (await Axios.get<AdminInboxPage>(base, { params: { page, limit: 20, unread } })).data,
  count: async () =>
    (await Axios.get<{ count: number }>(`${base}/unread-count`)).data.count,
  read: async (id: string) => Axios.patch(`${base}/${id}/read`),
  readAll: async () => Axios.patch(`${base}/read-all`),
};

function decodeVapidKey(value: string): Uint8Array {
  const padded = `${value}${'='.repeat((4 - value.length % 4) % 4)}`;
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export const adminBrowserPush = {
  supported: () => typeof window !== 'undefined' &&
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window,
  async status(): Promise<'unsupported' | 'disabled' | 'enabled'> {
    if (!this.supported()) return 'unsupported';
    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = await registration?.pushManager.getSubscription();
    return subscription && Notification.permission === 'granted' ? 'enabled' : 'disabled';
  },
  async enable(): Promise<void> {
    if (!this.supported()) throw new Error('Browser notifications are not supported here.');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Browser notification permission was not granted.');
    const { data } = await Axios.get<{ publicKey: string | null }>('/apps/deliveries/web-push/key');
    if (!data.publicKey) throw new Error('Browser notifications are not configured on the server.');
    const registration = await navigator.serviceWorker.register('/admin-sw.js', { scope: '/' });
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeVapidKey(data.publicKey) as BufferSource,
    });
    const serialized = subscription.toJSON();
    await Axios.post('/apps/deliveries/web-push/subscriptions', {
      endpoint: subscription.endpoint,
      keys: serialized.keys,
    });
  },
  async disable(): Promise<void> {
    if (!this.supported()) return;
    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;
    await Axios.delete('/apps/deliveries/web-push/subscriptions', {
      data: { endpoint: subscription.endpoint },
      timeout: 2000,
    });
    await subscription.unsubscribe();
  },
};
