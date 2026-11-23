'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDeliveryIssues, useReplacementRiders, DeliveryIssue, IssueAction } from '@/hooks/api/super-admin/enatega-deliveries/delivery-issues';
import { useCurrency } from '@/hooks/use-currency';
import { hasNamedPermission } from '@/lib/user';
import { getSocket } from '@/lib/socket';

export default function DeliveryIssuePanel({ orderId }: { orderId: string }) {
  const t = useTranslations('orders.deliveryIssue');
  const tRiderStatus = useTranslations('orders.orderDetail.assignRiderModal.status');
  const { formatCurrency } = useCurrency();
  const { query, mutation } = useDeliveryIssues(orderId);
  const [selected, setSelected] = useState<DeliveryIssue | null>(null);
  const [action, setAction] = useState<IssueAction['action']>('resolve');
  const [note, setNote] = useState('');
  const [riderId, setRiderId] = useState('');
  const [riderPage, setRiderPage] = useState(1);
  const [snapshot, setSnapshot] = useState<{ orderRevision: string; assignmentVersion: number; refundAmount: number } | null>(null);
  const [error, setError] = useState('');
  const receipt = useRef<{ payload: string; key: string } | null>(null);
  const inFlight = useRef(false);
  const riders = useReplacementRiders(orderId, riderPage, !!selected && action === 'reassign');
  const canUpdate = hasNamedPermission('delivery_update_super_admin_order_status');
  const canAssign = hasNamedPermission('delivery_assign_rider_to_order');
  useEffect(() => {
    const socket = getSocket('deliveries');
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = (event: { orderId?: string; ticketId?: string }) => {
      if (inFlight.current) return;
      if (event.orderId === orderId || query.data?.reports.some((r) => r.id === event.ticketId)) {
        clearTimeout(timer); timer = setTimeout(() => void query.refetch(), 200);
      }
    };
    socket.on('support-updated', refresh); socket.on('order-status-updated-admin', refresh);
    return () => { clearTimeout(timer); socket.off('support-updated', refresh); socket.off('order-status-updated-admin', refresh); };
  }, [orderId, query.data?.reports, query.refetch]);
  const open = (report: DeliveryIssue, next: IssueAction['action']) => {
    setSelected(report); setAction(next); setRiderPage(1);
    if (query.data) setSnapshot({ orderRevision: query.data.orderRevision, assignmentVersion: query.data.assignmentVersion, refundAmount: query.data.refund.amount });
    setNote(''); setRiderId(''); setError(''); receipt.current = null;
  };
  const submit = async () => {
    if (!selected || !query.data || !snapshot || inFlight.current) return;
    if (action !== 'review' && !note.trim()) { setError(t('noteRequired')); return; }
    const current = query.data.reports.find((r) => r.id === selected.id);
    if (!current) return;
    const payload = { issueId: current.id, revision: selected.revision, ...snapshot,
      action, note: note.trim(), ...(action === 'reassign' ? { riderId } : {}) };
    const serialized = JSON.stringify(payload);
    if (receipt.current?.payload !== serialized) receipt.current = { payload: serialized, key: crypto.randomUUID() };
    inFlight.current = true; setError('');
    try { await mutation.mutateAsync({ ...payload, key: receipt.current.key }); setSelected(null); }
    catch (cause) {
      setError(isAxiosError<{ message?: string }>(cause) ? cause.response?.data?.message || cause.message : cause instanceof Error ? cause.message : t('failed'));
      // Reconcile timeouts/conflicts before any retry, preserving entered note.
      const refreshed = await query.refetch();
      const latest = refreshed.data;
      if (latest) {
        if (latest.reports.some((report) => report.history.some((event) => event.key === receipt.current?.key))) { setError(''); setSelected(null); return; }
        const updated = latest.reports.find((r) => r.id === selected.id);
        if (updated) setSelected(updated);
        setSnapshot({ orderRevision: latest.orderRevision, assignmentVersion: latest.assignmentVersion, refundAmount: latest.refund.amount });
      }
    } finally { inFlight.current = false; }
  };
  if (query.isPending) return <p className="py-3 text-sm text-muted-foreground" role="status">{t('loading')}</p>;
  if (query.isError) return <div role="alert" className="my-4"><p>{t('failed')}</p><Button variant="outline" onClick={() => void query.refetch()}>{t('retry')}</Button></div>;
  if (!query.data?.reports.length) return null;
  return <section className="mb-6 rounded-xl border border-sidebar-border bg-card p-5" id="delivery-issues">
    <h2 className="mb-4 text-lg font-semibold">{t('title')}</h2>
    <div className="space-y-6">{query.data.reports.map((report) => <article key={report.id} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><strong>{report.riderName}</strong><span className="text-sm text-muted-foreground">{t(`statuses.${report.status}`)}</span></div>
      <p className="whitespace-pre-wrap break-words text-sm">{report.description}</p>
      <p className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleString()}</p>
      <div className="flex flex-wrap gap-2">
        {report.riderPhone && <Button asChild variant="outline"><a href={`tel:${report.riderPhone.replace(/[^+0-9]/g, '')}`}>{t('call')}</a></Button>}
        {report.chatBoxId && hasNamedPermission('view_support_tickets') && <Button asChild variant="outline"><Link href={`/general/customer-support/deliveries/${report.chatBoxId}`}>{t('chat')}</Link></Button>}
        {report.allowedActions.review && canUpdate && <Button variant="outline" onClick={() => open(report, 'review')}>{t('review')}</Button>}
        {report.allowedActions.resolve && canUpdate && <Button variant="outline" onClick={() => open(report, 'resolve')}>{t('resolve')}</Button>}
        {report.allowedActions.reassign && canAssign && <Button variant="outline" onClick={() => open(report, 'reassign')}>{t('reassign')}</Button>}
        {report.allowedActions.cancel && canUpdate && <Button variant="destructive" onClick={() => open(report, 'cancel')}>{t('cancelOrder')}</Button>}
        {report.allowedActions.review && canUpdate && <Button variant="ghost" onClick={() => open(report, 'note')}>{t('addNote')}</Button>}
      </div>
      {!!report.history.length && <details className="text-sm"><summary className="cursor-pointer text-muted-foreground">{t('history')}</summary><ul className="mt-2 space-y-2">{report.history.map((event, index) => <li key={index} className="whitespace-pre-wrap break-words"><strong>{t(`actions.${event.action}`)}</strong> · {new Date(event.at).toLocaleString()}<p>{event.note}</p></li>)}</ul></details>}
    </article>)}</div>
    <Dialog open={!!selected} onOpenChange={(open) => { if (!mutation.isPending && !open) setSelected(null); }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>{t(`actions.${action}`)}</DialogTitle></DialogHeader>
        {action === 'cancel' && <p>{(snapshot?.refundAmount ?? 0) > 0 ? t('refund', { amount: formatCurrency(snapshot?.refundAmount ?? 0) }) : t('noRefund')}</p>}
        {action === 'reassign' && <><label htmlFor="replacement-rider">{t('chooseRider')}</label><select id="replacement-rider" className="w-full rounded-md border bg-background p-3" value={riderId} onChange={(e) => setRiderId(e.target.value)}>
          <option value="">{t('chooseRider')}</option>{riders.data?.data.filter((r) => r.id !== selected?.riderId && (r.is_available || ['Available', 'available', 'Busy', 'busy'].includes(r.status ?? ''))).map((r) => <option key={r.id} value={r.id}>{r.userProfile?.user?.name || r.name || r.id}{r.status?.toLowerCase() === 'busy' ? ` · ${tRiderStatus('busy')}` : ''}</option>)}</select>
          <div className="flex items-center gap-3"><Button variant="outline" disabled={riderPage === 1 || riders.isFetching} onClick={() => setRiderPage((page) => page - 1)}>{t('previous')}</Button><span>{riderPage}</span><Button variant="outline" disabled={!riders.data?.hasNextPage || riders.isFetching} onClick={() => setRiderPage((page) => page + 1)}>{t('next')}</Button></div>
          {riders.isPending && <p role="status">{t('loading')}</p>}{riders.isError && <Button variant="outline" onClick={() => void riders.refetch()}>{t('retry')}</Button>}</>}
        {action !== 'review' && <><label htmlFor="issue-note">{t('note')}</label><textarea id="issue-note" className="min-h-28 w-full rounded-md border bg-background p-3" maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} /></>}
        {action === 'reassign' && !riders.isPending && !riders.isError && !riders.data?.data.some((r) => r.id !== selected?.riderId && (r.is_available || ['Available', 'available', 'Busy', 'busy'].includes(r.status ?? ''))) && <p className="text-sm text-muted-foreground">{t('noRiders')}</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button disabled={mutation.isPending || (action === 'reassign' && (!riderId || !query.data.reports.find((r) => r.id === selected?.id)?.allowedActions.reassign))} onClick={() => void submit()}>{mutation.isPending ? t('saving') : t('confirm')}</Button>
      </DialogContent>
    </Dialog>
  </section>;
}
