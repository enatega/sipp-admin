'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { BellRing, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/use-socket';
import { getUser } from '@/lib/user';
import { ADMIN_NOTIFICATION_SOUND_STOP_EVENT, adminInboxApi, canOpenAdminNotification } from '@/lib/admin-operational-notifications';

/** Support ticket alerts ring until an admin acts; this only bounds a forgotten, unattended tab. */
const SUPPORT_SOUND_MAX_SECONDS = 10 * 60;
/** How often a ringing alert checks whether it was already handled elsewhere (e.g. read from the bell). */
const SUPPORT_HANDLED_CHECK_MS = 8_000;

interface AdminAlert {
  id: string;
  title: string;
  body: string;
  href: string | null;
  type?: string;
}

interface NotificationCreatedEvent {
  id?: unknown;
  title?: unknown;
  body?: unknown;
  href?: unknown;
  type?: unknown;
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
  const pathname = usePathname();
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
  const audioBuffer = useRef<Promise<AudioBuffer> | null>(null);
  const audioSource = useRef<AudioBufferSourceNode | null>(null);
  const soundGeneration = useRef(0);
  const toneSources = useRef(new Set<OscillatorNode>());
  const seenIds = useRef(new Set<string>());
  const lastSeenAt = useRef(Date.now());
  const lastUnreadCount = useRef<number | null>(null);
  const reconcileRef = useRef<((forceLatest?: boolean) => Promise<void>) | null>(null);
  const dismiss = useCallback(() => setAlert(null), []);
  const stopSound = useCallback(() => {
    soundGeneration.current += 1;
    audioSource.current?.stop();
    audioSource.current = null;
    toneSources.current.forEach((source) => source.stop());
    toneSources.current.clear();
  }, []);
  const acknowledge = useCallback(() => {
    stopSound();
    dismiss();
  }, [stopSound, dismiss]);

  useEffect(() => {
    window.addEventListener(ADMIN_NOTIFICATION_SOUND_STOP_EVENT, acknowledge);
    return () => window.removeEventListener(ADMIN_NOTIFICATION_SOUND_STOP_EVENT, acknowledge);
  }, [acknowledge]);

  useEffect(() => {
    stopSound();
    seenIds.current.clear();
    lastSeenAt.current = Date.now();
    lastUnreadCount.current = null;
    dismiss();
  }, [userId, dismiss, stopSound]);

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
      stopSound();
      audioBuffer.current = null;
      void audioContext.current?.close();
      audioContext.current = null;
    };
  }, [stopSound]);

  const playSound = useCallback(async (isSupportTicket: boolean) => {
    const generation = isSupportTicket ? ++soundGeneration.current : soundGeneration.current;
    try {
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      await context.resume();
      if (generation !== soundGeneration.current) return;
      if (!isSupportTicket) {
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
          toneSources.current.add(oscillator);
          oscillator.onended = () => {
            toneSources.current.delete(oscillator);
            oscillator.disconnect();
            gain.disconnect();
          };
          oscillator.start(noteStart);
          oscillator.stop(noteStart + 0.17);
        }
        return;
      }
      if (!audioBuffer.current) {
        audioBuffer.current = fetch('/support-ticket-beep.wav')
          .then((response) => {
            if (!response.ok) throw new Error('Unable to load support ticket sound');
            return response.arrayBuffer();
          })
          .then((buffer) => context.decodeAudioData(buffer))
          .catch((error) => {
            audioBuffer.current = null;
            throw error;
          });
      }
      const buffer = await audioBuffer.current;
      if (generation !== soundGeneration.current || context.state !== 'running') return;
      audioSource.current?.stop();
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(context.destination);
      audioSource.current = source;
      source.onended = () => {
        source.disconnect();
        if (audioSource.current === source) audioSource.current = null;
      };
      const start = context.currentTime;
      source.start(start);
      source.stop(start + SUPPORT_SOUND_MAX_SECONDS);
    } catch { /* Browsers may require a user gesture before playing sound. */ }
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const present = (item: AdminAlert) => {
      if (!item.title.trim() || !item.body.trim() || !claimAlert(userId, item.id, seenIds.current)) return;
      setAlert(item);
      void playSound(item.type === 'support_ticket');
    };
    const reconcile = async (forceLatest = false, wantedId?: string) => {
      const startedAt = Date.now();
      try {
        const page = await adminInboxApi.list(1, true);
        if (!active) return;
        const newest = page.data
          .filter((item) => !item.isRead && (item.id === wantedId || forceLatest || new Date(item.createdAt).getTime() > lastSeenAt.current))
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
        if (newest) present({ id: newest.id, title: newest.title, body: newest.description, href: newest.deep_link, type: newest.data?.type });
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
      if (typeof event.title !== 'string' || typeof event.body !== 'string' || typeof event.type !== 'string') {
        void reconcile(false, event.id);
        return;
      }
      present({
        id: event.id,
        title: event.title,
        body: event.body,
        href: typeof event.href === 'string' ? event.href : null,
        type: typeof event.type === 'string' ? event.type : undefined,
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
  const alertHref = alert?.href;
  const isSupportAlert = alert?.type === 'support_ticket';

  // Opening the conversation the alert points to is the action that ends a support alert.
  useEffect(() => {
    if (!isSupportAlert || !alertHref || !pathname) return;
    if (pathname === alertHref.split('?')[0]) acknowledge();
  }, [isSupportAlert, alertHref, pathname, acknowledge]);

  // The notification may also be read from the bell or another tab while the sound loops.
  useEffect(() => {
    if (!alertId || !isSupportAlert) return;
    let active = true;
    const interval = setInterval(() => {
      adminInboxApi.list(1, true).then((page) => {
        // A longer unread list is paged, so absence from page one proves nothing.
        if (active && page.total <= page.limit && !page.data.some((item) => item.id === alertId)) acknowledge();
      }).catch(() => undefined);
    }, SUPPORT_HANDLED_CHECK_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [alertId, isSupportAlert, acknowledge]);

  useEffect(() => {
    // Support alerts stay on screen with their sound until acknowledged.
    if (!alertId || isSupportAlert) return;
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
  }, [alertId, isSupportAlert, dismiss]);

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
          acknowledge();
        }}
        className="flex items-start gap-3 p-4 pr-12 transition-colors hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-500"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700"><BellRing className="size-5" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm font-semibold text-slate-900">{alert.title}</span>
          <span className="mt-1 block break-words text-sm leading-5 text-slate-600">{alert.body}</span>
        </span>
      </Link>
      <button type="button" onClick={acknowledge} aria-label={t('dismiss')} className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-sky-500"><X className="size-4" /></button>
    </div>,
    document.body,
  );
}
