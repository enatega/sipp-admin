'use client';

import { ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useForceLogout } from '@/hooks/api/super-admin/general/users';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';

interface ForceLogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userName: string;
  userId: string;
}

export function ForceLogoutDialog({
  open,
  onOpenChange,
  onSuccess,
  userName,
  userId,
}: ForceLogoutDialogProps) {
  const t = useTranslations('userDetail.dialogs.forceLogout');
  const { mutateAsync: forceLogout, isPending: isLoggingOut } =
    useForceLogout();

  const handleConfirm = async () => {
    try {
      await forceLogout(userId);
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
      variant="delete"
      confirmLabel={t('confirm')}
      onConfirm={handleConfirm}
      loading={isLoggingOut}
    />
  );
}
