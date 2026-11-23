'use client';

import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { Switch } from '@/components/ui/switch';
import { useFormikContext, type FormikValues } from 'formik';
import { useTranslations } from 'next-intl';

interface MaintenanceMessageSectionProps {
  maintenanceMessageImage?: string | null;
}

export default function MaintenanceMessageSection({
  maintenanceMessageImage,
}: MaintenanceMessageSectionProps) {
  const t = useTranslations('settings.appSettings.maintenanceMessage');
  const formik = useFormikContext<FormikValues>();

  const maintenanceEnabled = formik.values.maintenanceEnabled as boolean | undefined;

  return (
    <div className="rounded-lg border border-border bg-card p-6 h-full">
      <h3 className="text-base font-semibold mb-4">{t('title')}</h3>

      <div className="space-y-4">
        {/* Maintenance Mode Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="maintenanceEnabled">
            {t('enabledLabel')}
          </label>
          <Switch
            id="maintenanceEnabled"
            checked={maintenanceEnabled || false}
            onCheckedChange={(checked) => {
              formik.setFieldValue('maintenanceEnabled', checked);
              formik.setFieldTouched('maintenanceEnabled', true);
            }}
          />
        </div>

        {/* Maintenance Image Upload */}
        <AppFileInput
          name="maintenanceImage"
          helperText={t('imageHelper')}
          previewHeight={80}
          maxSizeMB={5}
          showClearButton={false}
          acceptTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
          previewUrl={maintenanceMessageImage || undefined}
        />

        {/* Helper Text */}
        <p className="text-sm text-muted-foreground">{t('helperText')}</p>
      </div>
    </div>
  );
}
