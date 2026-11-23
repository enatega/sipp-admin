'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { cn } from '@/lib/utils';
import { PREPARING_TIME_OPTIONS } from '@/lib/store-notifications';

interface Props {
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the chosen preparation time; the order is accepted with it. */
  onConfirm: (minutes: number) => void;
}

/** Same step as the store app: an order is accepted only with a preparation time. */
export function PreparingTimeDialog(props: Props) {
  // Mount only while open so every order starts without a preselected time.
  return props.open ? <PreparingTimeDialogContent {...props} /> : null;
}

function PreparingTimeDialogContent({ open, loading, onOpenChange, onConfirm }: Props) {
  const t = useTranslations('storeNotifications');
  const [selected, setSelected] = useState<number | null>(null);

  const close = (next: boolean) => {
    if (loading) return;
    onOpenChange(next);
  };

  return (
    <AppAlertDialog
      open={open}
      onOpenChange={close}
      variant="primary"
      size="md"
      title={t('prepTitle')}
      subTitle={t('prepHint')}
      confirmLabel={t('prepConfirm')}
      confirmDisabled={selected === null}
      loading={loading}
      onConfirm={() => {
        if (selected !== null) onConfirm(selected);
      }}
    >
      <div role="radiogroup" aria-label={t('prepTitle')} className="mt-4 grid grid-cols-3 gap-2">
        {PREPARING_TIME_OPTIONS.map((minutes) => {
          const isSelected = selected === minutes;
          return (
            <button
              key={minutes}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={loading}
              onClick={() => setSelected(minutes)}
              className={cn(
                'h-12 rounded-lg border text-sm transition focus-visible:outline-2 focus-visible:outline-primary',
                isSelected
                  ? 'border-primary bg-primary font-semibold text-primary-foreground'
                  : 'border-slate-200 bg-slate-50 font-medium text-slate-900 hover:border-primary/60',
              )}
            >
              {t('minutes', { minutes })}
            </button>
          );
        })}
      </div>
    </AppAlertDialog>
  );
}
