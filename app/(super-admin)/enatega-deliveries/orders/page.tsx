'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getUser } from '@/lib/user';
import { useGetOrders } from '@/hooks/api/super-admin/enatega-deliveries/orders';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSocket } from '@/hooks/use-socket';
import type { GetOrdersResponse } from '@/types';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import { TableShimmer } from '@/components/shared/TableShimmer';
import { OrdersHeader } from '@/components/super-admin/enatega-deliveries/orders/main/header';
import { OrdersTable } from '@/components/super-admin/enatega-deliveries/orders/main/table';

type OrderStatusUpdatedAdminPayload = {
  orderId: string;
  status: string;
  orderType: 'pickup' | 'delivery';
  storeId: string | null;
  storeName: string | null;
  customerName: string | null;
  riderId: string | null;
  riderName: string | null;
  totalAmount: number | null;
  updatedAt: string;
};

function Page() {
  const t = useTranslations('orders');
  const { getParam } = useQueryParams();
  const startDate = getParam('start_date') || undefined;
  const endDate = getParam('end_date') || undefined;

  const orderQueryParams = useMemo(
    () => ({
      start_date: startDate,
      end_date: endDate,
    }),
    [startDate, endDate],
  );

  const ordersQuery = useGetOrders(orderQueryParams);
  const apiRes = ordersQuery.data as GetOrdersResponse | undefined;
  const { isLoading, error, refetch } = ordersQuery;
  const { socket, connected } = useSocket(undefined, {
    namespace: 'deliveries',
  });
  const userId = getUser()?.id ?? null;

  const mapped = useMemo(
    () =>
      (apiRes?.data || []).map((item) => ({
        orderId: item.orderId,
        customerName: item.customerName || t('notAvailable'),
        customerPhone: item.customerPhone || t('notAvailable'),
        customerProfile: item.customerProfile || '',
        vendorName: item.vendorName || t('notAvailable'),
        storeName: item.storeName || t('notAvailable'),
        orderType: item.orderType || t('notAvailable'),
        amount: item.amount || 0,
        status: item.status || t('notAvailable'),
        dateTime: item.dateTime || t('notAvailable'),
        riderId: item.riderId ?? null,
        riderName: item.riderName ?? null,
        riderPhone: item.riderPhone ?? null,
        pickupLocation: item.pickupLocation ?? null,
        dropoffLocation: item.dropoffLocation ?? null,
        riderLocation: item.riderLocation ?? null,
      })),
    [apiRes?.data, t],
  );

  const [orders, setOrders] = useState(mapped);

  useEffect(() => {
    setOrders(mapped);
  }, [mapped]);

  useEffect(() => {
    const handler = (payload: OrderStatusUpdatedAdminPayload) => {
      if (!payload?.orderId) return;

      setOrders((prev) => {
        const idx = prev.findIndex((o) => o.orderId === payload.orderId);
        if (idx === -1) return prev;

        const current = prev[idx];
        const next = {
          ...current,
          status: payload.status || current.status,
          orderType: payload.orderType || current.orderType,
          storeName: payload.storeName || current.storeName,
          customerName: payload.customerName || current.customerName,
          amount:
            typeof payload.totalAmount === 'number'
              ? payload.totalAmount
              : current.amount,
          dateTime: payload.updatedAt || current.dateTime,
          riderId: payload.riderId ?? current.riderId,
          riderName: payload.riderName ?? current.riderName,
        };

        if (next === current) return prev;
        const copy = prev.slice();
        copy[idx] = next;
        return copy;
      });
    };

    socket.on('order-status-updated-admin', handler);
    return () => {
      socket.off('order-status-updated-admin', handler);
    };
  }, [socket]);

  useEffect(() => {
    if (!connected || !userId) return;
    socket.emit('add-user', userId);
  }, [connected, socket, userId]);

  const toAllowedLimit = (v?: number): 10 | 25 | 50 | 100 | undefined => {
    if (v === 10 || v === 25 || v === 50 || v === 100) return v;
    return undefined;
  };

  return (
    <>
      <OrdersHeader data={orders} />

      {error ? (
        <DisplayError
          message={
            error instanceof Error ? error.message : t('fetchFailedMessage')
          }
          onRetry={() => refetch?.()}
        />
      ) : isLoading ? (
        <div className="rounded-t-md border overflow-hidden mb-0">
          <table className="min-w-full">
            <tbody>
              <TableShimmer limit={10} columns={9} />
            </tbody>
          </table>
        </div>
      ) : orders.length === 0 ? (
        <NoDataFound />
      ) : (
        <OrdersTable
          data={orders}
          page={apiRes?.page}
          limit={toAllowedLimit(apiRes?.limit)}
          total={apiRes?.total}
          isLoading={isLoading}
          onOrderUpdated={() => refetch()}
        />
      )}
    </>
  );
}

export default Page;
