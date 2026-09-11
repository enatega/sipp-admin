'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGetStoreOrderDetail } from '@/hooks/api/store/deliveries/orders';
import { useGetOrderDetail as useGetSuperOrderDetail } from '@/hooks/api/super-admin/enatega-deliveries/orders';
// Spinner import removed (unused)
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import { Heading } from '@/components/shared/Heading';
import { OrderDetailMain } from './order-detail-main';
import { OrderDetailShimmer } from './OrderDetailShimmer';

// Lazy load MapTrackingModal for better performance
const MapTrackingModal = dynamic(() => import('./MapTrackingModal'), {
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-accent animate-pulse rounded-lg">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
  ssr: false,
});

export function OrderDetailPage() {
  const tTable = useTranslations('orders.table');
  const tDetail = useTranslations('orders.orderDetail');
  const params = useParams();
  const orderIdParam = params.orderId;
  const normalizedOrderId = Array.isArray(orderIdParam)
    ? orderIdParam[0]
    : orderIdParam;
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const storeIdParam = params.storeId;
  const storeId = Array.isArray(storeIdParam) ? storeIdParam[0] : storeIdParam;

  // Always call both hooks (Rules of Hooks). Gate each with `enabled` so only
  // the relevant one actually fires a network request.
  const superResult = useGetSuperOrderDetail(normalizedOrderId, {
    enabled: !storeId,
  });
  const storeResult = useGetStoreOrderDetail(normalizedOrderId);
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = storeId ? storeResult : superResult;

  if (isLoading) return <OrderDetailShimmer />;

  if (isError)
    return (
      <div className="mt-6">
        <DisplayError
          message={(() => {
            const msg = (error as ApiErrorResponse)?.response?.data?.message;
            if (!msg) return tDetail('fetchFailedMessage');
            if (Array.isArray(msg)) return msg.join(', ');
            return String(msg);
          })()}
          onRetry={() => refetch()}
        />
      </div>
    );

  if (!order) return <DisplayError message={tDetail('notFound')} />;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Heading
          title={tDetail('title')}
          showBackBtn
          containerClassName="mb-0"
        />
        <AppButton
          variant="primary"
          onClick={() => setIsTrackModalOpen(true)}
          className="h-10 px-6 w-full sm:w-auto"
          leftIcon={<MapPin size={18} />}
          disabled={order.summary.status?.toLowerCase() === 'pending'}
        >
          {tTable('liveTracking')}
        </AppButton>
      </div>
      <OrderDetailMain order={order} />
      <MapTrackingModal
        open={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        order={order}
      />
    </>
  );
}
