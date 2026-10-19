'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { BellRing, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/use-socket';
import { getUser } from '@/lib/user';
import { adminInboxApi, canOpenAdminNotification } from '@/lib/admin-operational-notifications';

interface AdminAlert {
  id: string;
  title: string;
  body: string;
  href: string | null;
}

interface NotificationCreatedEvent {
  id?: unknown;
  title?: unknown;
  body?: unknown;
  href?: unknown;
}

function claimAlert(userId: string, id: string, localSeen: Set<string>): boolean {
  if (localSeen.has(id)) return false;
  localSeen.add(id);
  try {
    const key = `sipp:admin-seen-notification-alerts:${userId}`;
    const stored: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    const seen = Array.isArray(stored)
      ? stored.filter((value): value is string => typeof value === 'string')
      : [];
    if (seen.includes(id)) return false;
    localStorage.setItem(key, JSON.stringify([...seen.slice(-79), id]));
  } catch { /* In-memory deduplication still works when storage is unavailable. */ }
  return true;
}

export function AdminNotificationAlerts() {
  const t = useTranslations('adminNotificationAlert');
  const queryClient = useQueryClient();
  const { socket } = useSocket(undefined, { namespace: 'deliveries' });
  const userId = getUser()?.id;
  const countQuery = useQuery({
    queryKey: ['admin-notifications', 'count'],
    queryFn: adminInboxApi.count,
    enabled: Boolean(userId),
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });
  const [alert, setAlert] = useState<AdminAlert | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const seenIds = useRef(new Set<string>());
  const lastSeenAt = useRef(Date.now());
  const lastUnreadCount = useRef<number | null>(null);
  const reconcileRef = useRef<((forceLatest?: boolean) => Promise<void>) | null>(null);
  const dismiss = useCallback(() => setAlert(null), []);

  useEffect(() => {
    seenIds.current.clear();
    lastSeenAt.current = Date.now();
    lastUnreadCount.current = null;
    dismiss();
  }, [userId, dismiss]);

  useEffect(() => {
    const unlock = () => {
      try {
        const context = audioContext.current ?? new AudioContext();
        audioContext.current = context;
        if (context.state !== 'running') void context.resume().catch(() => undefined);
      } catch { /* The popup remains available if audio is blocked. */ }
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      void audioContext.current?.close();
      audioContext.current = null;
    };
  }, []);

  const playSound = useCallback(async () => {
    try {
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      await context.resume();
      const start = context.currentTime;
      for (const [index, frequency] of [784, 1046, 880].entries()) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const noteStart = start + index * 0.18;
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.24, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.16);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.17);
      }
    } catch { /* Browsers may require a user gesture before playing sound. */ }
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const present = (item: AdminAlert) => {
      if (!item.title.trim() || !item.body.trim() || !claimAlert(userId, item.id, seenIds.current)) return;
      setAlert(item);
      void playSound();
    };
    const reconcile = async (forceLatest = false, wantedId?: string) => {
      const startedAt = Date.now();
      try {
        const page = await adminInboxApi.list(1, true);
        if (!active) return;
        const newest = page.data
          .filter((item) => !item.isRead && (item.id === wantedId || forceLatest || new Date(item.createdAt).getTime() > lastSeenAt.current))
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
        if (newest) present({ id: newest.id, title: newest.title, body: newest.description, href: newest.deep_link });
        lastSeenAt.current = startedAt;
      } catch { /* The inbox refreshes again on the next focus or connection. */ }
    };
    reconcileRef.current = (forceLatest = false) => reconcile(forceLatest);
    const onConnect = () => {
      socket.emit('add-user', userId);
      void reconcile();
    };
    const onNotification = (event: NotificationCreatedEvent) => {
      if (typeof event?.id !== 'string') return;
      if (typeof event.title !== 'string' || typeof event.body !== 'string') {
        void reconcile(false, event.id);
        return;
      }
      present({
        id: event.id,
        title: event.title,
        body: event.body,
        href: typeof event.href === 'string' ? event.href : null,
      });
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reconcile();
    };
    socket.on('connect', onConnect);
    socket.on('notification-created', onNotification);
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    if (socket.connected) onConnect();
    return () => {
      active = false;
      reconcileRef.current = null;
      socket.off('connect', onConnect);
      socket.off('notification-created', onNotification);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [socket, userId, playSound]);

  useEffect(() => {
    if (!userId || countQuery.data === undefined) return;
    const previous = lastUnreadCount.current;
    lastUnreadCount.current = countQuery.data;
    if (previous !== null && countQuery.data > previous) {
      void reconcileRef.current?.(true);
    }
  }, [countQuery.data, userId]);

  const alertId = alert?.id;
  useEffect(() => {
    if (!alertId) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const scheduleDismiss = () => {
      if (timeout) clearTimeout(timeout);
      if (document.visibilityState === 'visible') timeout = setTimeout(dismiss, 5_000);
    };
    scheduleDismiss();
    document.addEventListener('visibilitychange', scheduleDismiss);
    return () => {
      if (timeout) clearTimeout(timeout);
      document.removeEventListener('visibilitychange', scheduleDismiss);
    };
  }, [alertId, dismiss]);

  if (!alert) return null;
  const href = canOpenAdminNotification(alert.href)
    ? alert.href
    : '/general/operational-notifications';

  return createPortal(
    <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-[60] w-[min(400px,calc(100vw-40px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <Link
        href={href}
        onClick={() => {
          void adminInboxApi.read(alert.id)
            .then(() => queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }))
            .catch(() => undefined);
          dismiss();
        }}
        className="flex items-start gap-3 p-4 pr-12 transition-colors hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-500"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700"><BellRing className="size-5" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm font-semibold text-slate-900">{alert.title}</span>
          <span className="mt-1 block break-words text-sm leading-5 text-slate-600">{alert.body}</span>
        </span>
      </Link>
      <button type="button" onClick={dismiss} aria-label={t('dismiss')} className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-sky-500"><X className="size-4" /></button>
    </div>,
    document.body,
  );
}
