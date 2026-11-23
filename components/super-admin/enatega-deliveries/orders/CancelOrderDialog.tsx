'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { ApiErrorResponse } from '@/types';
import { useUpdateStoreOrderStatus } from '@/hooks/api/store/deliveries/orders';
import { useUpdateSuperAdminOrderStatus } from '@/hooks/api/super-admin/enatega-deliveries/orders';
import { handleApiError } from '@/lib/toast-error';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';

export function CancelOrderDialog({
  orderId,
  storeOrder = false,
  onClose,
  onSuccess,
}: {
  orderId: string;
  storeOrder?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [reason, setReason] = useState('');
  const adminUpdate = useUpdateSuperAdminOrderStatus();
  const storeUpdate = useUpdateStoreOrderStatus();
  const { mutateAsync: updateStatus, isPending } = storeOrder ? storeUpdate : adminUpdate;

  const handleCancel = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason || isPending) return;
    try {
      await updateStatus({ orderId, status: 'cancelled', reason: trimmedReason });
      toast.success('Order cancelled successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <AppAlertDialog
      title="Cancel Order"
      subTitle="Why are you cancelling this order?"
      description="The customer will see this reason. Any applicable refund will be recorded."
      open
      onOpenChange={(open) => !open && onClose()}
      variant="delete"
      confirmLabel="Cancel Order"
      confirmDisabled={!reason.trim()}
      loading={isPending}
      onConfirm={() => void handleCancel()}
    >
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        maxLength={200}
        rows={4}
        autoFocus
        placeholder="Enter cancellation reason"
        className="mt-4 w-full resize-none rounded-md border bg-white p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
      <div className="mt-1 text-right text-xs text-muted-foreground">
        {reason.length}/200
      </div>
    </AppAlertDialog>
  );
}
