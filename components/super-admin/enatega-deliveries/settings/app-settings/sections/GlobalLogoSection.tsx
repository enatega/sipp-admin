'use client';

import { AppDialog } from '@/components/shared/AppDialog';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { FormikValues, useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import * as React from 'react';

interface GlobalLogoSectionProps {
  logoUrl?: string | null;
}

export default function GlobalLogoSection({ logoUrl }: GlobalLogoSectionProps) {
  const t = useTranslations('settings.appSettings.globalLogo');
  const formik = useFormikContext<FormikValues>();
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const logoValue = formik.values.logo as File | string | undefined;

  return (
    <div className="rounded-lg border border-border bg-card p-6 h-full">
      <h3 className="text-base font-semibold mb-4">{t('title')}</h3>

      <AppFileInput
        name="logo"
        helperText={t('helperText')}
        previewHeight={80}
        maxSizeMB={5}
        showClearButton={false}
        acceptTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']}
        previewUrl={logoUrl || undefined}
      />

      <AppDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={t('previewTitle')}
        size="2xl"
      >
        <div className="flex h-[60vh] items-center justify-center">
          {(logoValue || logoUrl) && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoValue instanceof File ? URL.createObjectURL(logoValue) : (logoValue || logoUrl || '')}
              alt={t('previewAlt')}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
      </AppDialog>
    </div>
  );
}