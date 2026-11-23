'use client';

import { RefreshCw, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OfflineScreenProps {
  isChecking: boolean;
  onRetry: () => void;
}

/** Full-page offline state shown while the browser has no connection. */
export function OfflineScreen({ isChecking, onRetry }: OfflineScreenProps) {
  const t = useTranslations('offline');
  const tips = [t('tipWifi'), t('tipData'), t('tipAirplane')];

  return (
    <div
      aria-describedby="offline-screen-description"
      aria-labelledby="offline-screen-title"
      aria-modal="true"
      className="fixed inset-0 z-[10000] grid place-items-center overflow-y-auto bg-background px-4 py-10"
      role="alertdialog"
    >
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-primary/10 text-ink">
          <WifiOff aria-hidden="true" className="size-9" />
        </span>
        <h1
          id="offline-screen-title"
          className="mt-6 text-2xl font-bold text-foreground"
        >
          {t('title')}
        </h1>
        <p
          id="offline-screen-description"
          className="mt-3 text-sm leading-6 text-muted-foreground"
        >
          {t('description')}
        </p>
        <ul className="mx-auto mt-6 max-w-xs space-y-2 text-start text-sm text-muted-foreground">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
              />
              {tip}
            </li>
          ))}
        </ul>
        <button
          autoFocus
          className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          disabled={isChecking}
          onClick={onRetry}
          type="button"
        >
          <RefreshCw
            aria-hidden="true"
            className={`size-4 ${isChecking ? 'animate-spin' : ''}`}
          />
          {isChecking ? t('checking') : t('retry')}
        </button>
        <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">
          {t('autoReturn')}
        </p>
      </div>
    </div>
  );
}
