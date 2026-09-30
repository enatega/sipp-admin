'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import type { OrderDetail } from '@/types';
import { useGetSimpleStores } from '@/hooks/api/super-admin/enatega-deliveries/orders';
import {
  useGetDeliveredRefundOrders,
  useGetRefundableAmount,
} from '@/hooks/api/super-admin/enatega-deliveries/refund-and-responsibilities';
import { Textarea } from '@/components/ui/textarea';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSearchableSelect } from '@/components/shared/form/AppSearchableSelect';

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
  const presetTotal = Number(
    order?.amount ??
      order?.payment?.totalAmount ??
      order?.summary.orderAmount ??
      0,
  );
  const [storeId, setStoreId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState(String(presetTotal));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const deferredOrderSearch = useDeferredValue(orderSearch.trim());

  const stores = useGetSimpleStores({ enabled: open && !order });
  const deliveredOrders = useGetDeliveredRefundOrders(
    storeId,
    open && !order,
    deferredOrderSearch,
  );
  const selectedOrder = deliveredOrders.data?.find(
    (item) => item.orderId === orderId,
  );
  const selectedOrderId = order?.orderId ?? orderId;
  const refundable = useGetRefundableAmount(
    selectedOrderId,
    open && !!selectedOrderId,
  );
  const originalTotal = order
    ? presetTotal
    : Number(selectedOrder?.amount ?? 0);
  const total = refundable.data?.remainingRefundableAmount ?? originalTotal;

  useEffect(() => {
    if (!open) return;
    setStoreId('');
    setOrderId(order?.orderId ?? '');
    setRefundType('full');
    setAmount(String(presetTotal || ''));
    setReason('');
    setError('');
    setOrderSearch('');
  }, [open, order?.orderId, presetTotal]);

  useEffect(() => {
    if (order || !selectedOrder) return;
    setRefundType('full');
    setAmount(String(selectedOrder.amount));
    setError('');
  }, [order, selectedOrder]);

  useEffect(() => {
    if (!open || !refundable.data) return;
    setRefundType('full');
    setAmount(String(refundable.data.remainingRefundableAmount || ''));
    setError('');
  }, [open, refundable.data]);

  const submit = async () => {
    const requestedAmount = Number(amount);
    if (!selectedOrderId) {
      setError('Select a delivered order.');
      return;
    }
    if (
      !Number.isFinite(requestedAmount) ||
      requestedAmount <= 0 ||
      requestedAmount > total
    ) {
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
  const storeOptions =
    stores.data?.map((store) => ({ key: store.storename, value: store.id })) ??
    [];
  const orderOptions =
    deliveredOrders.data?.map((item) => ({
      key: `#${item.orderId.slice(0, 8).toUpperCase()} · ${item.customerName || 'Customer'} · ₡ ${Number(item.amount).toFixed(2)}`,
      value: item.orderId,
    })) ?? [];

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
          <AppButton variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </AppButton>
          <AppButton
            variant="green"
            onClick={() => void submit()}
            isLoading={isLoading}
          >
            Create Refund
          </AppButton>
        </div>
      }
    >
      <div className="space-y-4 px-2 pt-4">
        <label className="block text-sm font-medium">
          Store
          {order ? (
            <select
              disabled
              value={order.store || order.summary.storeName || ''}
              className="mt-1.5 h-11 w-full rounded-xl border bg-gray-50 px-3 text-sm text-gray-700 disabled:opacity-100"
            >
              <option>
                {order.store || order.summary.storeName || 'Store'}
              </option>
            </select>
          ) : (
            <div className="mt-1.5">
              <AppSearchableSelect
                name="refundStore"
                options={storeOptions}
                value={storeId}
                onValueChange={(value) => {
                  setStoreId(value);
                  setOrderId('');
                  setAmount('');
                  setError('');
                  setOrderSearch('');
                }}
                placeholder="Select a store"
                searchPlaceholder="Search store by name..."
                emptyText="No stores found."
                loading={stores.isLoading}
                loadingText="Loading stores..."
              />
            </div>
          )}
        </label>
        <label className="block text-sm font-medium">
          Delivered order
          {order ? (
            <select
              disabled
              value={String(orderLabel)}
              className="mt-1.5 h-11 w-full rounded-xl border bg-gray-50 px-3 text-sm text-gray-700 disabled:opacity-100"
            >
              <option value={String(orderLabel)}>
                #{String(orderLabel).slice(0, 8).toUpperCase()} ·{' '}
                {order.customer?.name || 'Customer'} · ₡ {total.toFixed(2)}
              </option>
            </select>
          ) : (
            <div className="mt-1.5">
              <AppSearchableSelect
                name="refundOrder"
                options={orderOptions}
                value={orderId}
                onValueChange={(value) => {
                  setOrderId(value);
                  setError('');
                }}
                placeholder={
                  !storeId ? 'Select a store first' : 'Select a delivered order'
                }
                searchPlaceholder="Search customer, order ID, or amount..."
                onSearchChange={setOrderSearch}
                emptyText="No delivered orders found."
                loading={deliveredOrders.isLoading}
                loadingText="Loading delivered orders..."
                disabled={!storeId}
              />
            </div>
          )}
          <span className="mt-1 block text-xs text-muted-foreground">
            {order
              ? 'Order and store are preselected from the order detail page.'
              : 'Search by the order ID, customer name, phone number, or amount.'}
          </span>
          {refundable.data ? (
            <span className="mt-1 block text-xs font-medium text-emerald-700">
              Original ₡ {refundable.data.orderTotal.toFixed(2)} · Already
              refunded/reserved ₡{' '}
              {refundable.data.refundedOrReservedAmount.toFixed(2)} · Remaining
              ₡ {refundable.data.remainingRefundableAmount.toFixed(2)}
            </span>
          ) : null}
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
          <label className="mb-1.5 block text-sm font-medium">
            Reason (optional)
          </label>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Explain why the refund is being created..."
          />
        </div>
      </div>
    </AppDialog>
  );
}
