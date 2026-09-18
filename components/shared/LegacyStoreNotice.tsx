'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function LegacyStoreNotice() {
  const t = useTranslations('legacyStoreProfile');
  return (
    <div role="note" className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4 text-sm text-foreground">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 space-y-1">
        <p className="font-medium">{t('title')}</p>
        <p>{t('description')}</p>
        <p>{t('preservationHint')}</p>
      </div>
    </div>
  );
}
