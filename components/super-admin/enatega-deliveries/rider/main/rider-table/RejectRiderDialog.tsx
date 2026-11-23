'use client';

import { useState } from 'react';
import { ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { DeliveryRider } from '@/types/entities/super-admin/enatega-deliveries/rider';
import { handleApiError } from '@/lib/toast-error';
import { useRejectDeliveryRider } from '@/hooks/api/super-admin/enatega-deliveries/riders';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppTextarea } from '@/components/shared/form/AppTextarea';

interface RejectRiderDialogProps {
  open: boolean;
  rider: DeliveryRider | null;
  onClose: () => void;
}

export function RejectRiderDialog({
  open,
  rider,
  onClose,
}: RejectRiderDialogProps) {
  const t = useTranslations('driverManagement.driversTable');
  const [rejectionReason, setRejectionReason] = useState('');
  const { mutateAsync: rejectRider, isPending: isRejecting } =
    useRejectDeliveryRider();

  const handleReject = async () => {
    if (rider) {
      try {
        await rejectRider({
          riderId: rider.id,
          rejectionReason,
        });
        toast.success(t('riderRejectedSuccess'));
        setRejectionReason('');
        onClose();
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    }
  };

  const handleClose = () => {
    setRejectionReason('');
    onClose();
  };

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold">{t('rejectRiderDialogTitle')}</h3>
            <p className="text-sm text-gray-500 captilize">
              {rider?.userProfile?.user?.name || t('notAvailable')}
            </p>
          </div>
        </div>
      }
      size="lg"
      showCloseButton={true}
      footer={
        <div className="flex items-center justify-between pt-4 w-full">
          <div className="flex flex-row w-full justify-between items-stretch gap-3">
            <AppButton
              variant="secondary"
              onClick={handleClose}
              className="px-6"
            >
              {t('cancelButton')}
            </AppButton>
            <AppButton
              variant="red"
              onClick={handleReject}
              className="px-6"
              disabled={!rejectionReason.trim() || isRejecting}
              isLoading={isRejecting}
            >
              {t('rejectRiderButton')}
            </AppButton>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-4">
        <p className="text-sm text-gray-700">
          {t('rejectRiderReasonDescription')}
        </p>
        <AppTextarea
          label={t('rejectionReasonLabel')}
          name="rejectionReason"
          placeholder={t('rejectionReasonPlaceholder')}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          requiredAsterisk
          rows={4}
          className="resize-none"
        />
      </div>
    </AppDialog>
  );
}
