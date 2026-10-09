'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, ChevronRight, Inbox, Settings2 } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { getUser } from '@/lib/user';
import { adminBrowserPush, adminInboxApi } from '@/lib/admin-operational-notifications';
import type { AdminInboxItem } from '@/lib/admin-operational-notifications';

function canOpen(href: string | null): href is string {
  return Boolean(href && (
    href.startsWith('/deliveries/orders/') ||
    href.startsWith('/deliveries/refund-and-responsibilities/') ||
    href.startsWith('/deliveries/withdrawal-requests') ||
    href.startsWith('/deliveries/riders') ||
    href.startsWith('/deliveries/stores') ||
    href.startsWith('/deliveries/vendors') ||
    href.startsWith('/general/customer-support/')
  ));
}

function Item({ item, onOpen }: { item: AdminInboxItem; onOpen: (item: AdminInboxItem) => void }) {
  return (
    <button type="button" onClick={() => onOpen(item)}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-sky-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-sky-500">
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.isRead ? 'bg-slate-200' : 'bg-sky-500'}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <strong className="text-sm font-semibold text-slate-900">{item.title}</strong>
            <time className="shrink-0 text-xs text-slate-500" dateTime={item.createdAt}>
              {new Date(item.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </time>
          </div>
          <p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p>
        </div>
        <ChevronRight className="mt-1 size-4 shrink-0 text-slate-400" />
      </div>
    </button>
  );
}

export function AdminNotificationCenter({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [pushStatus, setPushStatus] = useState<'unsupported' | 'disabled' | 'enabled'>('disabled');
  const [pushError, setPushError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pushBusy, setPushBusy] = useState(false);
  const orderRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { socket, connected } = useSocket(undefined, { namespace: 'deliveries' });
  const userId = getUser()?.id;
  const countQuery = useQuery({ queryKey: ['admin-notifications', 'count'], queryFn: adminInboxApi.count });
  const listQuery = useQuery({
    queryKey: ['admin-notifications', 'list', compact ? 1 : page, compact ? false : unreadOnly],
    queryFn: () => adminInboxApi.list(compact ? 1 : page, compact ? false : unreadOnly),
    enabled: !compact || open,
  });

  useEffect(() => {
    if (connected && userId) {
      socket.emit('add-user', userId);
      void queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  }, [connected, userId, socket, queryClient]);

  useEffect(() => {
    const refresh = () => void queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    socket.on('notification-created', refresh);
    const onFocus = () => {
      if (document.visibilityState !== 'visible') return;
      refresh();
      if (compact) {
        void queryClient.invalidateQueries({ queryKey: ['get-orders'] });
        void queryClient.invalidateQueries({ queryKey: ['get-enatega-deliveries-dashboard-stats'] });
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      socket.off('notification-created', refresh);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [socket, queryClient, compact]);

  useEffect(() => {
    if (!compact) return;
    const refreshOrders = () => {
      if (orderRefreshTimer.current) clearTimeout(orderRefreshTimer.current);
      orderRefreshTimer.current = setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ['get-orders'] });
        void queryClient.invalidateQueries({ queryKey: ['get-enatega-deliveries-dashboard-stats'] });
      }, 600);
    };
    socket.on('order-status-updated-admin', refreshOrders);
    return () => {
      socket.off('order-status-updated-admin', refreshOrders);
      if (orderRefreshTimer.current) clearTimeout(orderRefreshTimer.current);
    };
  }, [compact, socket, queryClient]);

  useEffect(() => {
    if (!compact) void adminBrowserPush.status().then(setPushStatus).catch(() => setPushStatus('unsupported'));
  }, [compact]);

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

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
  const openItem = async (item: AdminInboxItem) => {
    if (!item.isRead) {
      try { await adminInboxApi.read(item.id); refresh(); } catch { /* The item remains unread if the request fails. */ }
    }
    if (canOpen(item.deep_link)) router.push(item.deep_link);
    else router.push('/general/operational-notifications');
    setOpen(false);
  };
  const markAll = async () => {
    setActionError('');
    try { await adminInboxApi.readAll(); setPage(1); refresh(); }
    catch { setActionError('Couldn’t mark notifications as read. Please try again.'); }
  };
  const togglePush = async () => {
    setPushBusy(true);
    setPushError('');
    try {
      if (pushStatus === 'enabled') await adminBrowserPush.disable();
      else await adminBrowserPush.enable();
      setPushStatus(await adminBrowserPush.status());
    } catch (error) {
      setPushError(error instanceof Error ? error.message : 'Unable to change browser notifications.');
    } finally { setPushBusy(false); }
  };

  if (compact) return (
    <div className="relative" ref={popoverRef}>
      <button type="button" onClick={() => setOpen(!open)} aria-label={`Admin notifications, ${countQuery.data ?? 0} unread`}
        aria-expanded={open} className="relative flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50">
        <Bell className="size-5" />
        {(countQuery.data ?? 0) > 0 && <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-sky-500 px-1 text-[11px] font-bold text-white">{Math.min(countQuery.data ?? 0, 99)}{(countQuery.data ?? 0) > 99 ? '+' : ''}</span>}
      </button>
      {open && <div className="absolute right-0 z-50 mt-3 w-[min(400px,calc(100vw-32px))] max-sm:fixed max-sm:inset-x-4 max-sm:w-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between"><strong className="text-base text-slate-900">Notifications</strong><button type="button" onClick={() => { router.push('/general/operational-notifications'); setOpen(false); }} className="text-sm font-medium text-sky-600 hover:underline">View all</button></div>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {listQuery.isError ? <p className="py-6 text-center text-sm text-red-600">Couldn’t load notifications.</p> :
            listQuery.isLoading ? <p className="py-6 text-center text-sm text-slate-500">Loading notifications…</p> :
            listQuery.data?.data.length ? listQuery.data.data.slice(0, 5).map((item) => <Item key={item.id} item={item} onOpen={openItem} />) :
            <p className="py-6 text-center text-sm text-slate-500">You’re all caught up.</p>}
        </div>
      </div>}
    </div>
  );

  const totalPages = Math.max(1, Math.ceil((listQuery.data?.total ?? 0) / 20));
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-sky-600">Operations</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Your notifications</h1><p className="mt-1 text-sm text-slate-600">Requests and order issues that need attention.</p></div>
        <button type="button" onClick={() => void markAll()} disabled={!countQuery.data} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><CheckCheck className="size-4" /> Mark all read</button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex gap-2"><button type="button" onClick={() => { setUnreadOnly(false); setPage(1); }} className={`rounded-lg px-3 py-2 text-sm ${!unreadOnly ? 'bg-sky-50 font-semibold text-sky-700' : 'text-slate-600'}`}>All</button><button type="button" onClick={() => { setUnreadOnly(true); setPage(1); }} className={`rounded-lg px-3 py-2 text-sm ${unreadOnly ? 'bg-sky-50 font-semibold text-sky-700' : 'text-slate-600'}`}>Unread ({countQuery.data ?? 0})</button></div>
        {pushStatus !== 'unsupported' && <button type="button" disabled={pushBusy} onClick={() => void togglePush()} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50 disabled:opacity-50"><Settings2 className="size-4" /> {pushStatus === 'enabled' ? 'Disable browser notifications' : 'Enable browser notifications'}</button>}
      </div>
      {pushError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{pushError}</p>}
      {actionError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
      {listQuery.isError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">Couldn’t load notifications. <button type="button" onClick={() => void listQuery.refetch()} className="font-semibold underline">Try again</button></p>}
      <div className="space-y-2">
        {listQuery.isLoading ? <p className="py-12 text-center text-slate-500">Loading notifications…</p> :
          listQuery.data?.data.length ? listQuery.data.data.map((item) => <Item key={item.id} item={item} onOpen={openItem} />) :
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center"><Inbox className="mx-auto size-9 text-sky-400" /><h2 className="mt-4 font-semibold text-slate-900">Nothing needs your attention</h2><p className="mt-1 text-sm text-slate-500">New requests and order issues will appear here.</p></div>}
      </div>
      {totalPages > 1 && <div className="flex items-center justify-center gap-4"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="text-sm text-sky-700 disabled:text-slate-400">Previous</button><span className="text-sm text-slate-600">{page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="text-sm text-sky-700 disabled:text-slate-400">Next</button></div>}
    </div>
  );
}
