'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import {
  useGetStripeModeStatus,
  useSetStripeMode,
} from '@/hooks/api/super-admin/enatega-deliveries/stripe-settings';
import type { StripeMode } from '@/lib/stripe';
import { handleApiError } from '@/lib/toast-error';
import { cn } from '@/lib/utils';

const MODES: StripeMode[] = ['sandbox', 'live'];

export function StripeModeSection() {
  const t = useTranslations('settings.configuration.stripeMode');
  const locale = useLocale();
  const { data: status, isLoading } = useGetStripeModeStatus();
  const { mutateAsync: setMode, isPending } = useSetStripeMode();
  const [pendingMode, setPendingMode] = useState<StripeMode | null>(null);

  const isConfigured = (mode: StripeMode) =>
    mode === 'live' ? Boolean(status?.liveConfigured) : Boolean(status?.sandboxConfigured);

  const handleConfirm = async () => {
    if (!pendingMode) return;
    try {
      await setMode(pendingMode);
      toast.success(t('toasts.switched', { mode: t(`modes.${pendingMode}.title`) }));
    } catch (err) {
      handleApiError(err as Parameters<typeof handleApiError>[0]);
    } finally {
      setPendingMode(null);
    }
  };

  const updatedAt = status?.updatedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(status.updatedAt),
      )
    : null;

  return (
    <div className="mt-8">
      <h3 className="mb-2 text-lg font-bold text-foreground">{t('sectionTitle')}</h3>
      <section className="space-y-4 rounded-xl border bg-white p-4">
        <p className="text-sm text-mute">{t('description')}</p>

        {isLoading ? (
          <div className="h-20 animate-pulse rounded-lg bg-muted" />
        ) : (
          <div role="radiogroup" aria-label={t('sectionTitle')} className="grid gap-3 md:grid-cols-2">
            {MODES.map((mode) => {
              const isActive = status?.mode === mode;
              const hasKeys = isConfigured(mode);
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  disabled={isActive || isPending || !hasKeys}
                  onClick={() => setPendingMode(mode)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed',
                    isActive
                      ? 'border-primary bg-primary/5'
                      : 'bg-slate-50 hover:border-primary/50 disabled:opacity-60',
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span
                      aria-hidden
                      className={cn(
                        'h-2 w-2 rounded-full',
                        isActive ? (mode === 'live' ? 'bg-help-green' : 'bg-primary') : 'bg-mute',
                      )}
                    />
                    {t(`modes.${mode}.title`)}
                    {isActive && (
                      <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium uppercase text-white">
                        {t('active')}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs text-mute">{t(`modes.${mode}.description`)}</span>
                  {!hasKeys && (
                    <span className="mt-1 block text-xs text-help-red">{t('keysMissing')}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {updatedAt && <p className="text-xs text-mute">{t('updated', { date: updatedAt })}</p>}
      </section>

      <AppAlertDialog
        open={pendingMode !== null}
        onOpenChange={(open) => !open && setPendingMode(null)}
        variant={pendingMode === 'live' ? 'delete' : 'primary'}
        title={pendingMode ? t(`confirm.${pendingMode}.title`) : ''}
        subTitle={pendingMode ? t(`confirm.${pendingMode}.subtitle`) : ''}
        confirmLabel={t('confirm.confirm')}
        cancelLabel={t('confirm.cancel')}
        loading={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setPendingMode(null)}
      />
    </div>
  );
}
