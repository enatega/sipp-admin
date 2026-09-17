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
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { useAcceptStoreOrder, useRejectStoreOrder } from '@/hooks/api/store/deliveries/orders';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const storeIdParam = params.storeId;
  const storeId = Array.isArray(storeIdParam) ? storeIdParam[0] : storeIdParam;
  const { mutateAsync: acceptOrder, isPending: isAccepting } = useAcceptStoreOrder();
  const { mutateAsync: rejectOrder, isPending: isRejecting } = useRejectStoreOrder();

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

  const normalizedStatus = String(order.status || order.summary.status || '').toLowerCase();
  const canAccept = Boolean(storeId) && ['pending', 'scheduled'].includes(normalizedStatus);
  const canReject = Boolean(storeId) && ['pending', 'accepted'].includes(normalizedStatus);

  const handleAccept = async () => {
    try {
      await acceptOrder(order.orderId);
      toast.success('Order accepted successfully');
      await refetch();
    } catch (actionError) {
      handleApiError(actionError as ApiErrorResponse);
    }
  };

  const handleReject = async () => {
    const reason = rejectionReason.trim();
    if (!reason) {
      toast.error('Please enter a rejection reason');
      return;
    }
    try {
      await rejectOrder({ orderId: order.orderId, reason });
      toast.success('Order rejected successfully');
      setShowRejectDialog(false);
      setRejectionReason('');
      await refetch();
    } catch (actionError) {
      handleApiError(actionError as ApiErrorResponse);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Heading
          title={tDetail('title')}
          showBackBtn
          containerClassName="mb-0"
        />
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        {canAccept && <AppButton
          variant="primary"
          onClick={handleAccept}
          disabled={isAccepting}
          className="h-10 px-6"
        >
          {isAccepting ? 'Accepting...' : 'Accept Order'}
        </AppButton>}
        {canReject && <AppButton
          variant="mute"
          onClick={() => setShowRejectDialog(true)}
          className="h-10 px-6 text-destructive border-destructive"
        >
          Reject Order
        </AppButton>}
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
      </div>
      <OrderDetailMain order={order} />
      <MapTrackingModal
        open={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        order={order}
      />
      {showRejectDialog && (
        <AppAlertDialog
          title="Reject Order"
          subTitle="Why are you rejecting this order?"
          description="This reason will be visible in the order history."
          open
          onOpenChange={setShowRejectDialog}
          variant="delete"
          confirmLabel="Reject Order"
          onConfirm={handleReject}
          loading={isRejecting}
        >
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            maxLength={200}
            rows={4}
            autoFocus
            placeholder="Enter rejection reason"
            className="mt-4 w-full resize-none rounded-md border bg-white p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="mt-1 text-right text-xs text-muted-foreground">
            {rejectionReason.length}/200
          </div>
        </AppAlertDialog>
      )}
    </>
  );
}
