'use client';

import { useTranslations } from 'next-intl';
import { useGetStoreOrders } from '@/hooks/api/store/deliveries/orders';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import { TableShimmer } from '@/components/shared/TableShimmer';
import { OrdersHeader } from '@/components/super-admin/enatega-deliveries/orders/main/header';
import { OrdersTable } from '@/components/super-admin/enatega-deliveries/orders/main/table';

function Page() {
  const t = useTranslations('orders');
  const { data: apiRes, isLoading, error, refetch } = useGetStoreOrders();

  const apiItems = apiRes?.data || [];
  const toAllowedLimit = (v?: number): 10 | 25 | 50 | 100 | undefined => {
    if (v === 10 || v === 25 || v === 50 || v === 100) return v;
    return undefined;
  };

  const mapped = apiItems.map((item) => ({
    orderId: item.orderId,
    customerName: item.customerName || t('notAvailable'),
    customerPhone: item.customerPhone || t('notAvailable'),
    customerProfile: item.customerProfile || '',
    vendorName: item.vendorName || t('notAvailable'),
    storeName: item.storeName || t('notAvailable'),
    riderName: item.riderName ?? null,
    riderProfile: item?.riderUser?.profile || t('notAvailable'),
    riderId: item.riderId ?? null,

    // Store orders API returns `product` where super-admin returns `orderType`
    orderType: item.product || item.orderType || t('notAvailable'),
    amount: item.amount || 0,
    status: item.status || t('notAvailable'),
    dateTime: item.dateTime || t('notAvailable'),
  }));

  return (
    <>
      <OrdersHeader data={mapped} hideStore />

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
      ) : mapped.length === 0 ? (
        <NoDataFound />
      ) : (
        <OrdersTable
          data={mapped}
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
