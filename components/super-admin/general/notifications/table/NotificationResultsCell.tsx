'use client';

import { NotificationMetadata } from '@/types';
import { useTranslations } from 'next-intl';

interface Props {
  metadata?: NotificationMetadata;
}

/** What a send achieved: devices that accepted it, then delivery receipts as tallied. */
export function NotificationResultsCell({ metadata }: Props) {
  const t = useTranslations('notifications.table');
  const stats = metadata?.sendStats;
  const receipts = metadata?.receiptStats;

  if (!stats) {
    return <span className="text-muted-foreground">{t('resultsNone')}</span>;
  }

  return (
    <div className="space-y-0.5 text-sm">
      <p>
        {t('resultsSent', { count: stats.successCount })}
        {stats.failureCount > 0 && (
          <span className="text-destructive">
            {' · '}
            {t('resultsFailed', { count: stats.failureCount })}
          </span>
        )}
      </p>
      {!!receipts && receipts.expected > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('resultsDelivery', {
            delivered: receipts.delivered,
            failed: receipts.failed,
          })}
        </p>
      )}
    </div>
  );
}
