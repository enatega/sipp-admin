'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { OfflineScreen } from '@/components/shared/OfflineScreen';
import {
  getNetworkStatus,
  getServerNetworkStatus,
  subscribeNetworkStatus,
  type NetworkStatus,
} from '@/lib/network-status';

const OFFLINE_SERVICE_WORKER = '/admin-sw.js';
const RESTORED_TOAST_ID = 'network-restored';

/**
 * Switches the admin to the offline screen as soon as the browser loses its
 * connection and returns to the same page when it comes back: the current
 * route stays mounted underneath, so nothing typed is lost. A weak
 * connection (requests failing while the browser still reports online)
 * shows a banner instead.
 *
 * Full page loads while offline (reload, typed URL) are covered by the
 * service worker, which serves /offline.html instead of the browser error.
 */
export function NetworkStatusAlert() {
  const t = useTranslations('networkStatus');
  const router = useRouter();
  const queryClient = useQueryClient();
  const status = useSyncExternalStore<NetworkStatus>(
    subscribeNetworkStatus,
    getNetworkStatus,
    getServerNetworkStatus,
  );
  const previousStatus = useRef<NetworkStatus>(status);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register(OFFLINE_SERVICE_WORKER, { scope: '/' })
      .catch(() => {
        // The in-app offline screen still works without the worker.
      });
  }, []);

  useEffect(() => {
    const previous = previousStatus.current;
    previousStatus.current = status;
    if (status === 'online' && previous !== 'online') {
      toast.success(t('restored'), { id: RESTORED_TOAST_ID });
      if (previous === 'offline') router.refresh();
    }
  }, [status, t, router]);

  useEffect(() => {
    if (status !== 'offline') return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [status]);

  if (status === 'online') return null;

  if (status === 'offline') {
    return (
      <OfflineScreen
        isChecking={isChecking}
        onRetry={() => {
          setIsChecking(true);
          // `online` fires on its own when the connection returns; this only
          // gives the user feedback that a check happened.
          window.setTimeout(() => setIsChecking(false), 1200);
        }}
      />
    );
  }

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-x-0 top-3 z-[9999] flex justify-center px-4"
      role="alert"
    >
      <div className="pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 shadow-lg dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
        <WifiOff aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t('unstableTitle')}</p>
          <p className="mt-0.5 text-xs opacity-90">{t('unstableDescription')}</p>
        </div>
        <button
          className="inline-flex shrink-0 items-center gap-1.5 self-center rounded-md border border-current/30 px-2.5 py-1 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10"
          onClick={() => void queryClient.refetchQueries({ type: 'active' })}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="size-3.5" />
          {t('retry')}
        </button>
      </div>
    </div>
  );
}
