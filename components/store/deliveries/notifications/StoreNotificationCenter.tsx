'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, ChevronRight, Inbox } from 'lucide-react';
import { getStorePath } from '@/lib/store';
import {
  STORE_ORDER_SOUND_STOP_EVENT,
  storeInboxApi,
  storeNotificationHref,
  storeNotificationKeys,
  type StoreInboxItem,
} from '@/lib/store-notifications';

const PAGE_SIZE = 20;

function Item({ item, onOpen }: { item: StoreInboxItem; onOpen: (item: StoreInboxItem) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-primary/50 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.isRead ? 'bg-slate-200' : 'bg-primary'}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <strong className="text-sm font-semibold text-slate-900">{item.title}</strong>
            <time className="shrink-0 text-xs text-slate-500" dateTime={item.createdAt}>
              {new Date(item.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </time>
          </div>
          <p className="mt-1 break-words text-sm leading-5 text-slate-600">{item.description}</p>
        </div>
        <ChevronRight className="mt-1 size-4 shrink-0 text-slate-400" aria-hidden="true" />
      </div>
    </button>
  );
}

export function StoreNotificationCenter({ storeId, compact = false }: { storeId: string; compact?: boolean }) {
  const t = useTranslations('storeNotifications');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState('');
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const notificationsPath = getStorePath(storeId, '/notifications');

  const countQuery = useQuery({
    queryKey: storeNotificationKeys.count,
    queryFn: storeInboxApi.count,
    refetchInterval: 30_000,
  });
  const listPage = compact ? 1 : page;
  const listQuery = useQuery({
    queryKey: storeNotificationKeys.list(listPage),
    queryFn: () => storeInboxApi.list(listPage, PAGE_SIZE),
    enabled: !compact || open,
  });
  const unread = countQuery.data ?? 0;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const refresh = () => void queryClient.invalidateQueries({ queryKey: storeNotificationKeys.all });
  const openItem = async (item: StoreInboxItem) => {
    if (!item.isRead) {
      try { await storeInboxApi.read(item.id); refresh(); } catch { /* It stays unread if the request fails. */ }
    }
    setOpen(false);
    router.push(storeNotificationHref(storeId, item) ?? notificationsPath);
  };
  const markAll = async () => {
    setActionError('');
    try { await storeInboxApi.readAll(); setPage(1); refresh(); }
    catch { setActionError(t('markAllError')); }
  };

  if (compact) return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => {
          window.dispatchEvent(new Event(STORE_ORDER_SOUND_STOP_EVENT));
          setOpen(!open);
        }}
        aria-label={t('bellLabel', { count: unread })}
        aria-expanded={open}
        className="relative flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
            {Math.min(unread, 99)}{unread > 99 ? '+' : ''}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(400px,calc(100vw-32px))] rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xl max-sm:fixed max-sm:inset-x-4 max-sm:w-auto">
          <div className="mb-3 flex items-center justify-between">
            <strong className="text-base text-slate-900">{t('title')}</strong>
            <button
              type="button"
              onClick={() => { setOpen(false); router.push(notificationsPath); }}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {listQuery.isError ? <p className="py-6 text-center text-sm text-red-600">{t('loadError')}</p>
              : listQuery.isLoading ? <p className="py-6 text-center text-sm text-slate-500">{t('loading')}</p>
                : listQuery.data?.data.length
                  ? listQuery.data.data.slice(0, 5).map((item) => <Item key={item.id} item={item} onOpen={openItem} />)
                  : <p className="py-6 text-center text-sm text-slate-500">{t('empty')}</p>}
          </div>
        </div>
      )}
    </div>
  );

  const totalPages = Math.max(1, Math.ceil((listQuery.data?.total ?? 0) / PAGE_SIZE));
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{t('title')}</h1>
          <p className="mt-1 text-sm text-slate-600">{t('pageSubtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => void markAll()}
          disabled={!unread}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <CheckCheck className="size-4" /> {t('markAllRead')}
        </button>
      </div>
      {actionError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
      {listQuery.isError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('loadError')}{' '}
          <button type="button" onClick={() => void listQuery.refetch()} className="font-semibold underline">{t('retry')}</button>
        </p>
      )}
      <div className="space-y-2">
        {listQuery.isLoading ? <p className="py-12 text-center text-slate-500">{t('loading')}</p>
          : listQuery.data?.data.length ? listQuery.data.data.map((item) => <Item key={item.id} item={item} onOpen={openItem} />)
            : !listQuery.isError && (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                <Inbox className="mx-auto size-9 text-primary" />
                <h2 className="mt-4 font-semibold text-slate-900">{t('emptyTitle')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('emptyBody')}</p>
              </div>
            )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="text-sm text-primary disabled:text-slate-400">{t('previous')}</button>
          <span className="text-sm text-slate-600">{t('pageOf', { page, total: totalPages })}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="text-sm text-primary disabled:text-slate-400">{t('next')}</button>
        </div>
      )}
    </div>
  );
}
