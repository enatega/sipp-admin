'use client';

import { CheckCircle2, CircleAlert, Clock, Loader2, RotateCcw, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { cn } from '@/lib/utils';
import type { UploadFailure, UploadItem } from '@/hooks/bulk-image-upload/use-bulk-image-uploader';
import { formatFileSize } from './format';

export interface SkippedFile {
  fileName: string;
  reason: 'type' | 'size' | 'limit';
}

interface Props {
  items: UploadItem[];
  skipped: SkippedFile[];
  isRunning: boolean;
  summary: { total: number; done: number; failed: number; remaining: number; percent: number };
  onRetry: (ids: string[]) => void;
  onCancel: () => void;
  onDismiss: () => void;
}

export function UploadProgressPanel({
  items,
  skipped,
  isRunning,
  summary,
  onRetry,
  onCancel,
  onDismiss,
}: Props) {
  const t = useTranslations('bulkImageUpload.progress');

  if (!items.length && !skipped.length) return null;

  const failedIds = items.filter((it) => it.status === 'failed').map((it) => it.id);
  const finished = summary.total > 0 && summary.remaining === 0;

  const failureText = (failure?: UploadFailure, message?: string) => {
    switch (failure) {
      case 'invalid_key':
        return t('failures.invalidKey');
      case 'rate_limited':
        return t('failures.rateLimited');
      case 'too_large':
        return t('failures.tooLarge');
      case 'network':
        return t('failures.network');
      case 'cancelled':
        return t('failures.cancelled');
      default:
        return message || t('failures.generic');
    }
  };

  return (
    <section className="rounded-xl border bg-white p-4 sm:p-5" aria-live="polite">
      {summary.total > 0 && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {isRunning
                  ? t('uploadingTitle', { done: summary.done, total: summary.total })
                  : t('finishedTitle', { done: summary.done, total: summary.total })}
              </h2>
              <p className="mt-1 text-sm text-mute">
                {t('counts', {
                  done: summary.done,
                  failed: summary.failed,
                  remaining: summary.remaining,
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isRunning && (
                <AppButton variant="mute" size="sm" onClick={onCancel}>
                  {t('cancel')}
                </AppButton>
              )}
              {!isRunning && failedIds.length > 0 && (
                <AppButton
                  variant="secondary"
                  size="sm"
                  leftIcon={<RotateCcw size={14} />}
                  onClick={() => onRetry(failedIds)}
                >
                  {t('retryFailed', { count: failedIds.length })}
                </AppButton>
              )}
              {!isRunning && (
                <AppButton variant="mute" size="sm" onClick={onDismiss}>
                  {t('dismiss')}
                </AppButton>
              )}
            </div>
          </div>

          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={summary.percent}
            aria-label={t('progressLabel')}
          >
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-300',
                finished && summary.failed === 0 ? 'bg-help-green' : 'bg-primary',
              )}
              style={{ width: `${summary.percent}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-mute">{summary.percent}%</p>

          <ul className="mt-3 max-h-64 divide-y overflow-y-auto rounded-lg border">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="shrink-0">
                  {it.status === 'done' && <CheckCircle2 size={16} className="text-help-green" />}
                  {it.status === 'failed' && <CircleAlert size={16} className="text-help-red" />}
                  {it.status === 'uploading' && (
                    <Loader2 size={16} className="animate-spin text-ink" />
                  )}
                  {it.status === 'queued' && <Clock size={16} className="text-mute" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground" title={it.fileName}>
                    {it.fileName}
                  </span>
                  {it.status === 'failed' && (
                    <span className="block text-xs text-help-red">
                      {failureText(it.failure, it.message)}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-mute">
                  {it.status === 'uploading'
                    ? `${Math.round(it.progress * 100)}%`
                    : formatFileSize(it.size)}
                </span>
                {it.status === 'failed' && !isRunning && (
                  <button
                    type="button"
                    onClick={() => onRetry([it.id])}
                    className="shrink-0 rounded-md p-1.5 text-ink hover:bg-primary/10"
                    aria-label={t('retryOne', { name: it.fileName })}
                    title={t('retry')}
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {skipped.length > 0 && (
        <div className={cn(summary.total > 0 && 'mt-4')}>
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <X size={14} className="text-help-red" />
            {t('skippedTitle', { count: skipped.length })}
          </p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
            {skipped.map((s, index) => (
              <li key={`${s.fileName}-${index}`} className="flex gap-2 text-mute">
                <span className="truncate font-medium text-foreground" title={s.fileName}>
                  {s.fileName}
                </span>
                <span className="shrink-0">
                  —{' '}
                  {s.reason === 'type'
                    ? t('skipped.type')
                    : s.reason === 'size'
                      ? t('skipped.size')
                      : t('skipped.limit')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
