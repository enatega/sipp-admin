'use client';

import { useEffect, useState } from 'react';
import type { OrderDetail } from '@/types';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppInputField } from '@/components/shared/form/AppInput';
import { Textarea } from '@/components/ui/textarea';
import { useGetSimpleStores } from '@/hooks/api/super-admin/enatega-deliveries/orders';
import { useGetDeliveredRefundOrders } from '@/hooks/api/super-admin/enatega-deliveries/refund-and-responsibilities';

interface CreateRefundDialogProps {
  open: boolean;
  order?: OrderDetail;
  isLoading: boolean;
  onClose: () => void;
  onCreate: (values: {
    order_id: string;
    requested_amount: number;
    refund_type: 'full' | 'partial';
    reason?: string;
  }) => Promise<void>;
}

export function CreateRefundDialog({
  open,
  order,
  isLoading,
  onClose,
  onCreate,
}: CreateRefundDialogProps) {
  const presetTotal = Number(order?.amount ?? order?.payment?.totalAmount ?? order?.summary.orderAmount ?? 0);
  const [storeId, setStoreId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState(String(presetTotal));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const stores = useGetSimpleStores({ enabled: open && !order });
  const deliveredOrders = useGetDeliveredRefundOrders(storeId, open && !order);
  const selectedOrder = deliveredOrders.data?.find((item) => item.orderId === orderId);
  const total = order ? presetTotal : Number(selectedOrder?.amount ?? 0);

  useEffect(() => {
    if (!open) return;
    setStoreId('');
    setOrderId(order?.orderId ?? '');
    setRefundType('full');
    setAmount(String(presetTotal || ''));
    setReason('');
    setError('');
  }, [open, order?.orderId, presetTotal]);

  useEffect(() => {
    if (order || !selectedOrder) return;
    setRefundType('full');
    setAmount(String(selectedOrder.amount));
    setError('');
  }, [order, selectedOrder]);

  const submit = async () => {
    const requestedAmount = Number(amount);
    const selectedOrderId = order?.orderId ?? orderId;
    if (!selectedOrderId) {
      setError('Select a delivered order.');
      return;
    }
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0 || requestedAmount > total) {
      setError(`Enter an amount between 0.01 and ${total.toFixed(2)}.`);
      return;
    }
    await onCreate({
      order_id: selectedOrderId,
      requested_amount: requestedAmount,
      refund_type: refundType,
      reason: reason.trim() || undefined,
    });
  };

  const orderLabel = order?.summary.orderId || order?.orderId;

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Create Refund"
      size="md"
      showDefaultFooter={false}
      bodyClassName="bg-white"
      footer={
        <div className="flex w-full justify-end gap-2">
          <AppButton variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</AppButton>
          <AppButton variant="green" onClick={() => void submit()} isLoading={isLoading}>Create Refund</AppButton>
        </div>
      }
    >
      <div className="space-y-4 px-2 pt-4">
        <label className="block text-sm font-medium">
          Store
          {order ? (
            <select disabled value={order.store || order.summary.storeName || ''} className="mt-1.5 h-11 w-full rounded-xl border bg-gray-50 px-3 text-sm text-gray-700 disabled:opacity-100">
              <option>{order.store || order.summary.storeName || 'Store'}</option>
            </select>
          ) : (
            <select value={storeId} onChange={(event) => { setStoreId(event.target.value); setOrderId(''); setAmount(''); setError(''); }} className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-sm">
              <option value="">{stores.isLoading ? 'Loading stores...' : 'Select a store'}</option>
              {stores.data?.map((store) => <option key={store.id} value={store.id}>{store.storename}</option>)}
            </select>
          )}
        </label>
        <label className="block text-sm font-medium">
          Delivered order
          {order ? (
            <select disabled value={String(orderLabel)} className="mt-1.5 h-11 w-full rounded-xl border bg-gray-50 px-3 text-sm text-gray-700 disabled:opacity-100">
              <option value={String(orderLabel)}>#{String(orderLabel).slice(0, 8).toUpperCase()} · {order.customer?.name || 'Customer'} · ${total.toFixed(2)}</option>
            </select>
          ) : (
            <select value={orderId} disabled={!storeId || deliveredOrders.isLoading} onChange={(event) => setOrderId(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-sm disabled:bg-gray-50">
              <option value="">{!storeId ? 'Select a store first' : deliveredOrders.isLoading ? 'Loading delivered orders...' : 'Select a delivered order'}</option>
              {deliveredOrders.data?.map((item) => <option key={item.orderId} value={item.orderId}>#{item.orderId.slice(0, 8).toUpperCase()} · {item.customerName || 'Customer'} · ${Number(item.amount).toFixed(2)}</option>)}
            </select>
          )}
          <span className="mt-1 block text-xs text-muted-foreground">{order ? 'Order and store are preselected from the order detail page.' : 'Search by the order ID, customer name, phone number, or amount.'}</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <AppInputField
            name="refundAmount"
            type="number"
            label="Refund amount"
            min={0.01}
            max={total}
            step="0.01"
            value={amount}
            disabled={refundType === 'full' || (!order && !selectedOrder)}
            onChange={(event) => setAmount(event.target.value)}
            error={error}
          />
          <label className="block text-sm font-medium">
            Refund type
            <select
              value={refundType}
              onChange={(event) => {
                const nextType = event.target.value as 'full' | 'partial';
                setRefundType(nextType);
                if (nextType === 'full') setAmount(String(total));
                setError('');
              }}
              className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-sm"
            >
              <option value="full">Full refund</option>
              <option value="partial">Partial refund</option>
            </select>
          </label>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Reason (optional)</label>
          <Textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} rows={3} placeholder="Explain why the refund is being created..." />
        </div>
      </div>
    </AppDialog>
  );
}
