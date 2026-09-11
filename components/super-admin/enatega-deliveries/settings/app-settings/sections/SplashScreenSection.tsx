'use client';

import { AppDialog } from '@/components/shared/AppDialog';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { FormikValues, useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import * as React from 'react';

interface SplashScreenSectionProps {
  // appType is reserved for future use
  splashImageUrl?: string | null;
}

export default function SplashScreenSection({ splashImageUrl }: SplashScreenSectionProps) {
  const t = useTranslations('settings.appSettings.splashScreen');
  const formik = useFormikContext<FormikValues>();
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const splashValue = formik.values.splashImage as File | string | undefined;

  return (
    <div className="rounded-lg border border-border bg-card p-6 h-full">
      <h3 className="text-base font-semibold mb-4">{t('title')}</h3>

      <AppFileInput
        name="splashImage"
        helperText={t('helperText')}
        previewHeight={80}
        maxSizeMB={5}
        showClearButton={false}
        acceptTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
        previewUrl={splashImageUrl || undefined}
      />

      <AppDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={t('previewTitle')}
        size="2xl"
      >
        <div className="flex h-[60vh] items-center justify-center">
          {splashValue && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={splashValue instanceof File ? URL.createObjectURL(splashValue) : splashValue}
              alt={t('previewAlt')}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
      </AppDialog>
    </div>
  );
}
