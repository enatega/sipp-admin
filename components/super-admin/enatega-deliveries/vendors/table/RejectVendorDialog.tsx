'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppTextarea } from '@/components/shared/form/AppTextarea';

interface RejectVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (reason: string) => void;
  isLoading?: boolean;
  vendorName: string;
}

export default function RejectVendorDialog({
  open,
  onOpenChange,
  onReject,
  isLoading = false,
  vendorName,
}: RejectVendorDialogProps) {
  const t = useTranslations('lumiFood.vendors.rejectDialog');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleConfirm = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason);
      setRejectionReason('');
    }
  };

  const handleCancel = () => {
    setRejectionReason('');
    onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onClose={handleCancel}
      title={
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold">{t('title')}</h3>
            <p className="text-sm text-gray-500">{vendorName}</p>
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
              onClick={handleCancel}
              className="px-6"
              disabled={isLoading}
            >
              {t('cancel')}
            </AppButton>
            <AppButton
              variant="red"
              onClick={handleConfirm}
              className="px-6"
              disabled={!rejectionReason.trim() || isLoading}
              isLoading={isLoading}
            >
              {t('confirm')}
            </AppButton>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-4">
        <p className="text-sm text-gray-700">{t('description')}</p>
        <AppTextarea
          label={t('reasonLabel')}
          name="rejectionReason"
          placeholder={t('reasonPlaceholder')}
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
