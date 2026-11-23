'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  HISTORY_CHANGE_EVENT,
  pruneHistory,
  readHistorySnapshot,
  toDayKey,
  type BulkImageRecord,
} from '@/lib/bulk-image-upload/history';

type Snapshot = { records: BulkImageRecord[]; todayKey: string };

const EMPTY: Snapshot = { records: [], todayKey: '' };
let cached: { raw: string | null; todayKey: string; snapshot: Snapshot } | null = null;

const getSnapshot = (): Snapshot => {
  const todayKey = toDayKey(new Date());
  const { raw, records } = readHistorySnapshot(new Date());
  if (cached && cached.raw === raw && cached.todayKey === todayKey) return cached.snapshot;
  const snapshot = { records, todayKey };
  cached = { raw, todayKey, snapshot };
  return snapshot;
};

const getServerSnapshot = () => EMPTY;

/**
 * Re-reads on changes from this tab and other tabs, when the page becomes
 * visible again, and just after local midnight so the day tabs roll over.
 * Expired days are removed from storage whenever one of those happens.
 */
const subscribe = (notify: () => void) => {
  let timer: number | undefined;
  const update = () => {
    pruneHistory();
    notify();
  };
  const scheduleMidnight = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
    timer = window.setTimeout(() => {
      update();
      scheduleMidnight();
    }, next.getTime() - now.getTime());
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') update();
  };

  pruneHistory();
  scheduleMidnight();
  window.addEventListener(HISTORY_CHANGE_EVENT, notify);
  window.addEventListener('storage', update);
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener(HISTORY_CHANGE_EVENT, notify);
    window.removeEventListener('storage', update);
    document.removeEventListener('visibilitychange', onVisible);
  };
};

export function useBulkImageHistory() {
  const { records, todayKey } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = useMemo(() => {
    if (!todayKey) return new Date();
    const [y, m, d] = todayKey.split('-').map(Number);
    return new Date(y, m - 1, d, 12);
  }, [todayKey]);
  return { records, now, ready: Boolean(todayKey) };
}
