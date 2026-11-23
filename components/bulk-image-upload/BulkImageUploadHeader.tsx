'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminBranding } from '@/contexts/super-admin/enatega-deliveries/settings/admin-branding-context';
import { toAbsoluteUrl } from '@/lib/helpers';

export function BulkImageUploadHeader() {
  const t = useTranslations('bulkImageUpload.page');
  const { logo, appName, isLoading } = useAdminBranding();
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="sticky top-0 z-20 h-16 border-b bg-white">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        {isLoading ? (
          <div className="h-9 w-28 animate-pulse rounded bg-muted" />
        ) : logo && !logoFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={toAbsoluteUrl(logo)}
            alt={appName}
            className="h-9 w-auto max-w-[140px] object-contain"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="text-lg font-semibold text-foreground">{appName}</span>
        )}
        <span className="h-6 w-px bg-border" aria-hidden />
        <span className="truncate text-sm font-medium text-mute">{t('headerLabel')}</span>
      </div>
    </header>
  );
}
