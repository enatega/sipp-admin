'use client';

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useUpdateMeasurementTestAccount } from '@/hooks/api/super-admin/measurement';
import { hasNamedPermission } from '@/lib/user';
import { returnErrorMessage } from '@/lib/toast-error';
import { AppButton } from '@/components/shared/AppButton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Props { customerId: string; detailId: string; isTest: boolean }

export function MeasurementTestAccountPanel({ customerId, detailId, isTest }: Props) {
  const t = useTranslations('analyticsTestAccount');
  const [selected, setSelected] = useState(isTest);
  const [isConfirming, setIsConfirming] = useState(false);
  const update = useUpdateMeasurementTestAccount(customerId, detailId);
  const canEdit = hasNamedPermission('manage_measurement');
  const hasChanges = selected !== isTest;

  return <section className="mt-6 rounded-xl border border-stroke bg-light p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
          <BarChart3 className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">{t('title')}</h3>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
      </div>
      <Badge variant="outline" className={isTest
        ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
        : 'border-green-200 bg-green-50 text-green-700'}>
        {isTest ? t('statusExcluded') : t('statusIncluded')}
      </Badge>
    </div>

    <div className="mt-5 flex items-start justify-between gap-4 rounded-lg border border-stroke bg-accent p-4">
      <div>
        <label htmlFor="analytics-test-account" className="text-sm font-medium">{t('label')}</label>
        <p id="analytics-test-account-help" className="mt-1 text-sm text-muted-foreground">
          {selected ? t('helpOn') : t('helpOff')}
        </p>
      </div>
      <Switch id="analytics-test-account" checked={selected} onCheckedChange={setSelected}
        disabled={!canEdit || update.isPending} aria-describedby="analytics-test-account-help" />
    </div>
    <p className="mt-3 text-xs text-muted-foreground">{t('note')}</p>

    {update.isError && <p role="alert" className="mt-3 text-sm text-destructive">{returnErrorMessage(update.error)}</p>}
    <div className="mt-4 flex items-center justify-end gap-3">
      {canEdit ? <>
        {hasChanges && !update.isPending && <span className="text-xs text-muted-foreground">{t('unsaved')}</span>}
        <AppButton type="button" isLoading={update.isPending}
          disabled={!hasChanges || update.isPending}
          onClick={() => setIsConfirming(true)}>
          {t('save')}
        </AppButton>
      </> : <p className="text-xs text-muted-foreground">{t('noPermission')}</p>}
    </div>
    <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{selected ? t('confirmOn') : t('confirmOff')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={() => update.mutate(selected, { onSuccess: () => toast.success(t('saved')) })}>
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>;
}
