'use client';

import { useTranslations } from 'next-intl';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import type { CategoryDeleteImpactResponse } from '@/types';

interface DeleteCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  impact: CategoryDeleteImpactResponse | undefined;
  isCheckingImpact: boolean;
  isImpactError: boolean;
}

/**
 * Delete confirmation that names the products blocking the delete.
 * Products keep a required link to their category, so a category with
 * products cannot be deleted until they are moved or deleted.
 */
export function DeleteCategoryDialog({
  open,
  onClose,
  onConfirm,
  isDeleting,
  impact,
  isCheckingImpact,
  isImpactError,
}: DeleteCategoryDialogProps) {
  const t = useTranslations('categories');
  const productCount = impact?.productCount ?? 0;
  const isBlocked = productCount > 0;

  let subTitle = t('errors.deleteDescription');
  let description = t('errors.deleteEmptyDescription');
  if (isCheckingImpact) {
    description = t('errors.deleteChecking');
  } else if (isImpactError) {
    description = t('errors.deleteImpactFailed');
  } else if (isBlocked) {
    subTitle = t('errors.deleteBlockedTitle', { count: productCount });
    description = t('errors.deleteBlockedDescription', { count: productCount });
  }

  return (
    <AppAlertDialog
      className="!w-[850px]"
      title={t('errors.deleteTitle')}
      subTitle={subTitle}
      description={description}
      open={open}
      onOpenChange={onClose}
      variant="delete"
      confirmLabel={t('errors.deleteConfirm')}
      onConfirm={onConfirm}
      loading={isDeleting}
      confirmDisabled={isCheckingImpact || isImpactError || isBlocked}
    />
  );
}
