'use client';

import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';

interface SendBarProps {
  /** One-line description of the audience, e.g. "Customers + Riders · Islamabad". */
  summary: string;
  /** Devices the confirmation question names. */
  devices: number;
  /** Text of the send button, which states the reach once it is known. */
  sendLabel: string;
  confirming: boolean;
  isPending: boolean;
  /** Sending is pointless or premature: nobody reachable, or reach still being computed. */
  sendDisabled: boolean;
  onSend: () => void;
  onConfirm: () => void;
  onBack: () => void;
}

export default function SendBar({
  summary,
  devices,
  sendLabel,
  confirming,
  isPending,
  sendDisabled,
  onSend,
  onConfirm,
  onBack,
}: SendBarProps) {
  const t = useTranslations('notifications.composer');

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-[12rem] flex-1 text-sm">
          <span className="font-medium">
            {t('confirmQuestion', { count: devices })}
          </span>{' '}
          <span className="text-muted-foreground">
            {summary} · {t('confirmNote')}
          </span>
        </p>
        <AppButton type="button" variant="secondary" onClick={onBack} disabled={isPending}>
          {t('back')}
        </AppButton>
        <AppButton type="button" onClick={onConfirm} isLoading={isPending}>
          {t('confirmAction')}
        </AppButton>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="min-w-[12rem] flex-1 text-sm text-muted-foreground">{summary}</p>
      <AppButton
        type="button"
        onClick={onSend}
        isLoading={isPending}
        disabled={sendDisabled}
      >
        {sendLabel}
      </AppButton>
    </div>
  );
}
