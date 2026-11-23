'use client';

import {
  Check,
  CircleAlert,
  CircleCheck,
  CircleX,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SendNotificationResponse } from '@/types';
import {
  RECEIPT_WINDOW_MS,
  useNotificationDelivery,
} from '@/hooks/api/super-admin/general/notifications';
import { AppButton } from '@/components/shared/AppButton';
import { cn } from '@/lib/utils';

interface SendResultProps {
  /** Devices the send is aimed at; shown while the request is in flight. */
  devices: number;
  /** Absent while the request is still running. */
  response?: SendNotificationResponse;
  onBackToEdit: () => void;
  onNew: () => void;
  onClose: () => void;
}

const KNOWN_REASONS = [
  'BadDeviceToken',
  'DeviceNotRegistered',
  'MessageRateExceeded',
  'InvalidCredentials',
  'MismatchSenderId',
  'MessageTooBig',
];

type Step = { label: string; detail?: string; state: 'done' | 'active' | 'idle' };

/**
 * Follows a send from request to delivery: sending, accepted by the push
 * service, then delivery receipts arriving per device until all are in.
 */
export default function SendResult({
  devices,
  response,
  onBackToEdit,
  onNew,
  onClose,
}: SendResultProps) {
  const t = useTranslations('notifications');
  const tResult = useTranslations('notifications.composer.result');

  const accepted = response?.sentCount ?? 0;
  const sent = accepted > 0;
  const { data: record } = useNotificationDelivery(response?.notificationId, sent);

  const receipts = record?.metadata?.receiptStats;
  const total = receipts?.expected || accepted;
  const delivered = receipts?.delivered ?? 0;
  const failed = receipts?.failed ?? 0;
  const pending = Math.max(0, total - delivered - failed);
  const sentAt = record?.metadata?.sendStats?.sentAt;
  const expired =
    pending > 0 && !!sentAt && Date.now() - Date.parse(sentAt) > RECEIPT_WINDOW_MS;
  const done = sent && !!receipts && pending === 0;
  const inFlight = !response || (sent && !done && !expired);

  let Icon: LucideIcon = Loader2;
  let iconClass = 'animate-spin text-primary';
  let headline: string;
  if (!response) {
    headline = tResult('sending', { count: devices });
  } else if (!sent) {
    Icon = CircleX;
    iconClass = 'text-destructive';
    headline = tResult('nothingSent');
  } else if (expired) {
    Icon = CircleAlert;
    iconClass = 'text-amber-600';
    headline = tResult('unconfirmedHeadline', { delivered, total });
  } else if (!done) {
    headline = tResult('delivering', { count: total });
  } else if (delivered === 0) {
    Icon = CircleX;
    iconClass = 'text-destructive';
    headline = tResult('deliveredNone', { total });
  } else if (failed > 0) {
    Icon = CircleAlert;
    iconClass = 'text-amber-600';
    headline = tResult('deliveredSome', { delivered, total });
  } else {
    Icon = CircleCheck;
    iconClass = 'text-green-600';
    headline = tResult('deliveredAll', { count: total });
  }

  const steps: Step[] = [
    {
      label: tResult('stepAccepted'),
      detail: response ? String(accepted) : undefined,
      state: response ? 'done' : 'active',
    },
    ...(!response || sent
      ? [
          {
            label: tResult('stepDelivered'),
            detail: response
              ? `${delivered + failed} / ${total}`
              : undefined,
            state: (done || expired ? 'done' : response ? 'active' : 'idle') as Step['state'],
          },
        ]
      : []),
  ];

  const percent = (value: number) => (total ? (value / total) * 100 : 0);
  const reasons = Object.entries(receipts?.reasons ?? {}).filter(([, count]) => count > 0);
  const reason = response?.errors?.[0] ? String(response.errors[0]) : '';

  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <Icon className={cn('size-5 shrink-0', iconClass)} aria-hidden="true" />
        <p className="text-[15px] font-medium">{headline}</p>
      </div>

      {(!response || sent) && (
        <div className="space-y-2">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total || devices}
            aria-valuenow={delivered + failed}
            className="flex h-2 overflow-hidden rounded-full bg-gray-100"
          >
            {response ? (
              <>
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${percent(delivered)}%` }}
                />
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${percent(failed)}%` }}
                />
                {inFlight && (
                  <div
                    className="h-full animate-pulse bg-primary/30 transition-all duration-500"
                    style={{ width: `${percent(pending)}%` }}
                  />
                )}
              </>
            ) : (
              <div className="h-full w-full animate-pulse bg-primary/30" />
            )}
          </div>

          {response && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <li className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-green-500" aria-hidden="true" />
                {tResult('legendDelivered')}
                <span className="font-medium tabular-nums">{delivered}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-500" aria-hidden="true" />
                {tResult('legendFailed')}
                <span className="font-medium tabular-nums">{failed}</span>
              </li>
              {pending > 0 && (
                <li className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-full bg-gray-300" aria-hidden="true" />
                  {expired ? tResult('legendUnconfirmed') : tResult('legendWaiting')}
                  <span className="font-medium tabular-nums">{pending}</span>
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {!sent && response && (
        <p className="text-sm text-muted-foreground">{reason || tResult('noReason')}</p>
      )}

      {(!response || sent) && (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-2">
              {step.state === 'done' ? (
                <Check className="size-4 text-green-600" aria-hidden="true" />
              ) : step.state === 'active' ? (
                <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
              ) : (
                <span className="size-4 rounded-full border border-stroke" aria-hidden="true" />
              )}
              <span>{step.label}</span>
              {step.detail && (
                <span className="font-medium tabular-nums text-foreground">{step.detail}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {response && sent && !done && !expired && (
        <p className="text-xs text-muted-foreground">{tResult('acceptedHelp')}</p>
      )}

      {response && response.failedCount > 0 && (
        <p className="text-sm text-destructive">
          {tResult('partialFailed', { count: response.failedCount })}
        </p>
      )}

      {reasons.length > 0 && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">
          <p className="mb-1 font-medium">{tResult('failureReasons')}</p>
          <ul className="space-y-0.5">
            {reasons.map(([code, count]) => (
              <li key={code}>
                <span className="tabular-nums">{count}</span> ×{' '}
                {tResult(`reasons.${KNOWN_REASONS.includes(code) ? code : 'Unknown'}`)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!!response?.breakdown?.length && (
        <p className="text-xs text-muted-foreground">
          {response.breakdown
            .map((row) => `${t(`userTypes.${row.userType.toLowerCase()}`)}: ${row.accepted}/${row.targets}`)
            .join(' · ')}
        </p>
      )}

      {response && (
        <div className="flex flex-wrap justify-end gap-2">
          {sent ? (
            <>
              <AppButton type="button" variant="secondary" onClick={onClose}>
                {tResult('close')}
              </AppButton>
              <AppButton type="button" onClick={onNew}>
                {tResult('newNotification')}
              </AppButton>
            </>
          ) : (
            <AppButton type="button" onClick={onBackToEdit}>
              {tResult('backToEdit')}
            </AppButton>
          )}
        </div>
      )}
    </div>
  );
}
