'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { AppButton } from '@/components/shared/AppButton';
import { useBulkUploadProductsStatus } from '@/hooks/api/store/deliveries/product-management/products';

export interface BulkUploadTrackingRecord {
  jobId: string;
  fileName: string;
  totalRows: number;
  estimatedProducts: number;
  queuedAt: number;
}

interface BulkProductUploadStatusProps {
  upload: BulkUploadTrackingRecord;
  onDismiss: () => void;
  onUploadAnother: () => void;
}

const SLOW_UPLOAD_THRESHOLD_MS = 2 * 60 * 1000;

export function BulkProductUploadStatus({
  upload,
  onDismiss,
  onUploadAnother,
}: BulkProductUploadStatusProps) {
  const t = useTranslations('products.bulkUpload.tracker');
  const queryClient = useQueryClient();
  const statusQuery = useBulkUploadProductsStatus(upload.jobId);
  const [now, setNow] = React.useState(() => Date.now());
  const handledJobRef = React.useRef<string | null>(null);
  const status = statusQuery.data?.status;
  const isRunning = statusQuery.isPending || status === 'pending' || status === 'active';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const hasPartialFailures = (statusQuery.data?.result?.failedProducts ?? 0) > 0;
  const failedProducts = statusQuery.data?.result?.errors ?? [];
  const isTakingLonger = isRunning && now - upload.queuedAt >= SLOW_UPLOAD_THRESHOLD_MS;
  const progress = typeof statusQuery.data?.progress === 'number'
    ? Math.min(Math.max(statusQuery.data.progress, 0), 100)
    : undefined;

  React.useEffect(() => {
    if (!isRunning) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  React.useEffect(() => {
    if (!isCompleted || handledJobRef.current === upload.jobId) return;
    handledJobRef.current = upload.jobId;
    void queryClient.invalidateQueries({
      queryKey: ['store-products'],
      exact: false,
      refetchType: 'active',
    });
    toast.success(
      hasPartialFailures
        ? t('toasts.completedWithErrors')
        : t('toasts.completed'),
    );
  }, [hasPartialFailures, isCompleted, queryClient, t, upload.jobId]);

  const title = statusQuery.isError
    ? t('statusUnavailableTitle')
    : isFailed
      ? t('failedTitle')
      : isCompleted && hasPartialFailures
        ? t('completedWithErrorsTitle')
        : isCompleted
          ? t('completedTitle')
          : isTakingLonger
            ? t('takingLongerTitle')
            : status === 'active'
              ? t('processingTitle')
              : t('queuedTitle');

  const detail = statusQuery.isError
    ? t('statusUnavailableDetail')
    : isFailed
      ? statusQuery.data?.error || t('failedDetail')
      : isCompleted && statusQuery.data?.result
        ? t('completedDetail', {
            successful: statusQuery.data.result.successfulProducts,
            total: statusQuery.data.result.totalProducts,
            failed: statusQuery.data.result.failedProducts,
          })
        : isTakingLonger
          ? t('takingLongerDetail')
          : t('runningDetail', { count: upload.estimatedProducts });

  const tone = isFailed
    ? 'border-destructive/35 bg-destructive/5'
    : statusQuery.isError || hasPartialFailures || isTakingLonger
      ? 'border-amber-300 bg-amber-50/70'
    : isCompleted
      ? 'border-emerald-200 bg-emerald-50/70'
      : 'border-primary/25 bg-primary/5';

  const StatusIcon = statusQuery.isError || isFailed || hasPartialFailures
    ? AlertTriangle
    : isCompleted
      ? CheckCircle2
      : isTakingLonger
        ? Clock3
        : Loader2;
  const iconTone = isFailed
    ? 'text-destructive'
    : statusQuery.isError || hasPartialFailures || isTakingLonger
      ? 'text-amber-600'
      : isCompleted
        ? 'text-emerald-600'
        : 'text-primary';

  return (
    <section
      className={`rounded-xl border p-4 ${tone}`}
      aria-live="polite"
      aria-label={t('regionLabel')}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <StatusIcon
              className={`size-5 ${iconTone} ${isRunning && !isTakingLonger ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              <span className="max-w-full truncate text-xs text-muted-foreground">
                {upload.fileName}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            {isCompleted && failedProducts.length > 0 ? (
              <div className="mt-3 max-w-2xl">
                <p className="text-sm font-medium text-foreground">
                  {t('failedProductsTitle')}
                </p>
                <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-sm text-muted-foreground">
                  {failedProducts.map((failure) => (
                    <li key={failure.productSku}>
                      <span className="font-medium text-foreground">{failure.productSku}</span>
                      {': '}
                      {failure.errorMessage}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {isRunning && !statusQuery.isError ? (
              <div className="mt-3 flex max-w-xl items-center gap-3">
                <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/15"
                  role="progressbar"
                  aria-label={t('progressLabel')}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <div
                    className={`h-full rounded-full bg-primary transition-[width] duration-500 ${progress === undefined ? 'w-1/2 animate-pulse' : ''}`}
                    style={progress === undefined ? undefined : { width: `${progress}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium text-muted-foreground">
                  {progress === undefined ? '—' : `${progress}%`}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 pl-12 lg:pl-0">
          {statusQuery.isError || isTakingLonger ? (
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw size={15} />}
              onClick={() => void statusQuery.refetch()}
              isLoading={statusQuery.isFetching}
            >
              {t('checkAgain')}
            </AppButton>
          ) : null}
          {isFailed || isCompleted ? (
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Upload size={15} />}
              onClick={onUploadAnother}
            >
              {t('uploadAnother')}
            </AppButton>
          ) : null}
          {statusQuery.isError || isFailed || isCompleted ? (
            <AppButton
              type="button"
              variant="mute"
              size="sm"
              leftIcon={<X size={15} />}
              onClick={onDismiss}
            >
              {t('dismiss')}
            </AppButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
