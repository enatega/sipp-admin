'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import { MapPin, ReceiptText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { hasNamedPermission } from '@/lib/user';
import {
  useAcceptStoreOrder,
  useGetStoreOrderDetail,
  useRejectStoreOrder,
  useUpdateStoreOrderStatus,
} from '@/hooks/api/store/deliveries/orders';
import {
  useGetOrderDetail as useGetSuperOrderDetail,
  useUpdateSuperAdminOrderStatus,
} from '@/hooks/api/super-admin/enatega-deliveries/orders';
import { useCreateRefundRequest } from '@/hooks/api/super-admin/enatega-deliveries/refund-and-responsibilities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
// Spinner import removed (unused)
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import { Heading } from '@/components/shared/Heading';
import { CreateRefundDialog } from '../../refund-and-responsibilities/CreateRefundDialog';
import {
  formatOrderStatusLabel,
  getNextOrderStatuses,
  getStoreNextOrderStatuses,
  isPickupOrder,
} from '../utils';
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
  const tStatuses = useTranslations('orders.statuses');
  const params = useParams();
  const orderIdParam = params.orderId;
  const normalizedOrderId = Array.isArray(orderIdParam)
    ? orderIdParam[0]
    : orderIdParam;
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);

  const storeIdParam = params.storeId;
  const storeId = Array.isArray(storeIdParam) ? storeIdParam[0] : storeIdParam;
  const { mutateAsync: acceptOrder, isPending: isAccepting } =
    useAcceptStoreOrder();
  const { mutateAsync: rejectOrder, isPending: isRejecting } =
    useRejectStoreOrder();
  const { mutateAsync: updateStoreStatus, isPending: isUpdatingStoreStatus } =
    useUpdateStoreOrderStatus();
  const { mutateAsync: updateAdminStatus, isPending: isUpdatingAdminStatus } =
    useUpdateSuperAdminOrderStatus();
  const { mutateAsync: createRefund, isPending: isCreatingRefund } =
    useCreateRefundRequest();

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

  const normalizedStatus = String(
    order.status || order.summary.status || '',
  ).toLowerCase();
  const canAccept =
    Boolean(storeId) && ['pending', 'scheduled'].includes(normalizedStatus);
  const canReject =
    Boolean(storeId) && ['pending', 'accepted'].includes(normalizedStatus);
  const pickupOrder = isPickupOrder(order.orderType);
  const nextStatuses = storeId
    ? getStoreNextOrderStatuses(normalizedStatus, order.orderType)
    : getNextOrderStatuses(normalizedStatus, order.orderType);
  const canUpdateStatus = storeId
    ? true
    : hasNamedPermission('delivery_update_super_admin_order_status');
  const showStatusControl =
    canUpdateStatus &&
    nextStatuses.length > 0 &&
    !['pending', 'scheduled'].includes(normalizedStatus);
  const isUpdatingStatus = isUpdatingStoreStatus || isUpdatingAdminStatus;

  const handleAccept = async () => {
    try {
      await acceptOrder(order.orderId);
      toast.success('Order accepted successfully');
    } catch (actionError) {
      handleApiError(actionError as ApiErrorResponse);
    } finally {
      // Refetch even on failure: a timed-out request may still have succeeded.
      await refetch();
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
    } catch (actionError) {
      handleApiError(actionError as ApiErrorResponse);
    } finally {
      await refetch();
    }
  };

  const handleStatusChange = async (status: string) => {
    if (isUpdatingStatus || status === normalizedStatus) return;
    try {
      const updateStatus = storeId ? updateStoreStatus : updateAdminStatus;
      await updateStatus({ orderId: order.orderId, status });
      toast.success('Order status updated successfully');
    } catch (actionError) {
      handleApiError(actionError as ApiErrorResponse);
    } finally {
      await refetch();
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
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {showStatusControl && (
            <Select
              value={normalizedStatus}
              disabled={isUpdatingStatus}
              onValueChange={(status) => void handleStatusChange(status)}
            >
              <SelectTrigger
                className="h-10 data-[size=default]:h-10 w-full sm:w-auto min-w-[190px] rounded-[8px] border-gray-200 bg-gray-100 px-4 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gray-200"
                aria-label="Update order status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={normalizedStatus}>
                  {formatOrderStatusLabel(
                    normalizedStatus,
                    tStatuses,
                    normalizedStatus.replace(/_/g, ' '),
                  )}
                </SelectItem>
                {nextStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatOrderStatusLabel(
                      status,
                      tStatuses,
                      status.replace(/_/g, ' '),
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {canAccept && (
            <AppButton
              variant="green"
              onClick={handleAccept}
              disabled={isAccepting}
              className="h-10 px-6"
            >
              {isAccepting ? 'Accepting...' : 'Accept Order'}
            </AppButton>
          )}
          {canReject && (
            <AppButton
              variant="red"
              onClick={() => setShowRejectDialog(true)}
              className="h-10 px-6 text-white"
            >
              Reject Order
            </AppButton>
          )}
          {!pickupOrder && (
            <AppButton
              variant="primary"
              onClick={() => setIsTrackModalOpen(true)}
              className="h-10 px-6 w-full sm:w-auto"
              leftIcon={<MapPin size={18} />}
              disabled={order.summary.status?.toLowerCase() === 'pending'}
            >
              {tTable('liveTracking')}
            </AppButton>
          )}
          {!storeId ? (
            <AppButton
              variant="secondary"
              onClick={() => setIsRefundDialogOpen(true)}
              className="h-10 px-6 w-full sm:w-auto"
              leftIcon={<ReceiptText size={18} />}
              title="Create Refund"
            >
              Create Refund
            </AppButton>
          ) : null}
        </div>
      </div>
      <OrderDetailMain order={order} />
      {!pickupOrder && (
        <MapTrackingModal
          open={isTrackModalOpen}
          onClose={() => setIsTrackModalOpen(false)}
          order={order}
        />
      )}
      <CreateRefundDialog
        open={isRefundDialogOpen}
        order={order}
        isLoading={isCreatingRefund}
        onClose={() => setIsRefundDialogOpen(false)}
        onCreate={async (payload) => {
          try {
            const response = await createRefund(payload);
            toast.success(
              response.message || 'Refund request created successfully',
            );
            setIsRefundDialogOpen(false);
          } catch (actionError) {
            handleApiError(actionError as ApiErrorResponse);
          }
        }}
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
