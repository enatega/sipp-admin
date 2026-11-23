'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { BellRing, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/use-socket';
import { getUser } from '@/lib/user';
import { getStorePath } from '@/lib/store';
import {
  STORE_ORDER_SOUND_STOP_EVENT,
  fetchStoreNewOrders,
  storeNotificationKeys,
} from '@/lib/store-notifications';

/** Same looping sound the store app plays for new orders (sipp-store new_order_beep_5s.wav). */
const ORDER_SOUND_URL = '/store-new-order-beep.wav';
/** How often to retry starting the sound if the browser blocked autoplay. */
const RING_RETRY_MS = 2_500;
/** Socket events can be missed while offline or asleep; the count is re-checked on this cadence. */
const NEW_ORDERS_POLL_MS = 15_000;

interface StoreOrderCreatedEvent {
  storeId?: unknown;
  order?: { orderId?: unknown; customerName?: unknown; status?: unknown };
}

/**
 * Rings while the store has orders waiting in "New", mirroring the store app:
 * level-triggered from the pending count, so orders already waiting when the
 * dashboard opens ring too, and accepting or rejecting the last one silences it.
 */
export function StoreOrderAlerts({ storeId }: { storeId: string }) {
  const t = useTranslations('storeNotifications');
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { socket } = useSocket(undefined, { namespace: 'deliveries' });
  const userId = getUser()?.id;
  const audioContext = useRef<AudioContext | null>(null);
  const audioBuffer = useRef<Promise<AudioBuffer> | null>(null);
  const audioSource = useRef<AudioBufferSourceNode | null>(null);
  const soundGeneration = useRef(0);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [mutedOrderId, setMutedOrderId] = useState<string | null>(null);
  const [liveCustomer, setLiveCustomer] = useState<{ orderId: string; name: string } | null>(null);

  const newOrders = useQuery({
    queryKey: storeNotificationKeys.newOrders(storeId),
    queryFn: () => fetchStoreNewOrders(storeId),
    refetchInterval: NEW_ORDERS_POLL_MS,
    refetchIntervalInBackground: true,
  });

  const total = newOrders.data?.total ?? 0;
  const latest = newOrders.data?.latest ?? null;
  const latestOrderId = latest?.orderId ?? null;
  // Muting lasts until another order arrives at the top of the queue.
  const muted = Boolean(latestOrderId && mutedOrderId === latestOrderId);
  const ringing = total > 0 && !muted;

  const refreshOrders = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: storeNotificationKeys.newOrders(storeId) });
    void queryClient.invalidateQueries({ queryKey: ['get-orders-store'] });
    void queryClient.invalidateQueries({ queryKey: ['get-store-order', storeId] });
    void queryClient.invalidateQueries({ queryKey: ['get-store-dashboard', storeId] });
  }, [queryClient, storeId]);

  // Realtime: the server pushes new orders and inbox items to the store user's room.
  useEffect(() => {
    if (!userId) return;
    const onConnect = () => {
      socket.emit('add-user', userId);
      refreshOrders();
      void queryClient.invalidateQueries({ queryKey: storeNotificationKeys.all });
    };
    const onOrderCreated = (event: StoreOrderCreatedEvent) => {
      if (String(event?.storeId ?? '') !== storeId) return;
      const orderId = typeof event.order?.orderId === 'string' ? event.order.orderId : null;
      const name = typeof event.order?.customerName === 'string' ? event.order.customerName : '';
      if (orderId) setLiveCustomer({ orderId, name });
      refreshOrders();
    };
    const onNotification = () => {
      void queryClient.invalidateQueries({ queryKey: storeNotificationKeys.all });
    };
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      refreshOrders();
      onNotification();
    };
    socket.on('connect', onConnect);
    socket.on('store-home-order-created', onOrderCreated);
    socket.on('order-status-updated', refreshOrders);
    socket.on('notification-created', onNotification);
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    if (socket.connected) onConnect();
    return () => {
      socket.off('connect', onConnect);
      socket.off('store-home-order-created', onOrderCreated);
      socket.off('order-status-updated', refreshOrders);
      socket.off('notification-created', onNotification);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [socket, userId, storeId, queryClient, refreshOrders]);

  const getContext = useCallback(() => {
    try {
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      return context;
    } catch {
      return null;
    }
  }, []);

  // Browsers only allow sound after the page has been interacted with.
  useEffect(() => {
    const unlock = () => {
      const context = getContext();
      if (!context) return;
      void context.resume().then(() => setSoundBlocked(false)).catch(() => undefined);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [getContext]);

  useEffect(() => () => {
    audioSource.current?.stop();
    audioSource.current = null;
    void audioContext.current?.close();
    audioContext.current = null;
  }, []);

  const loadBuffer = useCallback((context: AudioContext) => {
    if (!audioBuffer.current) {
      audioBuffer.current = fetch(ORDER_SOUND_URL)
        .then((response) => {
          if (!response.ok) throw new Error('Unable to load new order sound');
          return response.arrayBuffer();
        })
        .then((buffer) => context.decodeAudioData(buffer))
        .catch((error) => {
          audioBuffer.current = null;
          throw error;
        });
    }
    return audioBuffer.current;
  }, []);

  const stopSound = useCallback(() => {
    soundGeneration.current += 1;
    const source = audioSource.current;
    audioSource.current = null;
    if (!source) return;
    try {
      source.stop();
    } catch {
      // Already stopped.
    }
    source.disconnect();
  }, []);

  /** Loops the store app's new-order sound; a no-op while it already plays. */
  const startSound = useCallback(async () => {
    if (audioSource.current) return;
    const generation = soundGeneration.current;
    const context = getContext();
    if (!context) return;
    if (context.state !== 'running') {
      await context.resume().catch(() => undefined);
    }
    if (context.state !== 'running') {
      setSoundBlocked(true);
      return;
    }
    setSoundBlocked(false);
    try {
      const buffer = await loadBuffer(context);
      if (generation !== soundGeneration.current || audioSource.current || context.state !== 'running') return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(context.destination);
      source.onended = () => {
        if (audioSource.current === source) audioSource.current = null;
        source.disconnect();
      };
      audioSource.current = source;
      source.start();
    } catch (error) {
      console.warn('[store][order-alert] Unable to play new order sound', error);
    }
  }, [getContext, loadBuffer]);

  useEffect(() => {
    if (!ringing) return;
    // Retried on an interval so sound starts once the browser allows it.
    const first = setTimeout(() => void startSound(), 0);
    const retry = setInterval(() => void startSound(), RING_RETRY_MS);
    return () => {
      clearTimeout(first);
      clearInterval(retry);
      stopSound();
    };
  }, [ringing, startSound, stopSound]);

  const mute = useCallback(() => {
    if (latestOrderId) setMutedOrderId(latestOrderId);
  }, [latestOrderId]);

  useEffect(() => {
    window.addEventListener(STORE_ORDER_SOUND_STOP_EVENT, mute);
    return () => window.removeEventListener(STORE_ORDER_SOUND_STOP_EVENT, mute);
  }, [mute]);

  // Keep the tab title noticeable while orders wait in a background tab.
  useEffect(() => {
    if (total <= 0) return;
    const original = document.title;
    const flagged = `(${total}) ${t('newOrderTitle')}`;
    let showFlag = true;
    document.title = flagged;
    const interval = setInterval(() => {
      showFlag = !showFlag;
      document.title = showFlag ? flagged : original;
    }, 1_500);
    return () => {
      clearInterval(interval);
      document.title = original;
    };
  }, [total, t]);

  if (total <= 0 || !latestOrderId) return null;

  const orderHref = getStorePath(storeId, `/orders/${latestOrderId}`);
  const ordersHref = getStorePath(storeId, '/orders');
  const href = total === 1 ? orderHref : ordersHref;
  if (pathname === orderHref) return null;

  const customerName = (liveCustomer?.orderId === latestOrderId && liveCustomer.name)
    || latest?.customerName
    || '';

  return createPortal(
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-[60] w-[min(400px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-primary/30 bg-white shadow-xl"
    >
      <div className="flex items-start gap-3 p-4">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ${ringing ? 'animate-pulse' : ''}`}>
          <BellRing className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{t('newOrderTitle')}</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">{t('newOrdersWaiting', { count: total })}</p>
          {total === 1 && customerName ? (
            <p className="mt-0.5 truncate text-sm text-slate-500">{t('fromCustomer', { name: customerName })}</p>
          ) : null}
          {soundBlocked && ringing ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700">
              <Volume2 className="size-3.5" aria-hidden="true" />
              {t('enableSound')}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={href}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-primary"
            >
              {total === 1 ? t('viewOrder') : t('viewOrders')}
            </Link>
            {ringing ? (
              <button
                type="button"
                onClick={mute}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-primary"
              >
                <VolumeX className="size-4" aria-hidden="true" />
                {t('mute')}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
