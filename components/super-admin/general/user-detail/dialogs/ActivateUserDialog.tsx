'use client';

import { ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useDeactivateUser } from '@/hooks/api/super-admin/general/users'; // Using useDeactivateUser as per user instruction
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';

interface ActivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userName: string;
  userId: string;
}

export function ActivateUserDialog({
  open,
  onOpenChange,
  onSuccess,
  userName,
  userId,
}: ActivateUserDialogProps) {
  const t = useTranslations('userDetail.dialogs.activate');
  const { mutateAsync: deactivateUser, isPending: isActivating } =
    useDeactivateUser();

  const handleConfirm = async () => {
    try {
      await deactivateUser({
        userId,
        reason: 'User activated (via deactivate hook)',
      });
      toast.success(t('success'));
      onSuccess();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <AppAlertDialog
      title={t('title')}
      subTitle={t('subtitle')}
      description={t('description', { userName })}
      open={open}
      onOpenChange={onOpenChange}
      variant="primary"
      confirmLabel={t('confirm')}
      onConfirm={handleConfirm}
      loading={isActivating}
    />
  );
}
