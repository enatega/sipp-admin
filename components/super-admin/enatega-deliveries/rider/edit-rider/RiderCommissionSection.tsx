'use client';

import { AppInputField } from '@/components/shared/form/AppInput';
import { useTranslations } from 'next-intl';

export const RiderCommissionSection = () => {
  const t = useTranslations('driverManagement.editDriver');

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        {t('platformCommissionTitle')}
      </h2>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        {t('platformCommissionDescription')}
      </p>
      <AppInputField
        label={t('platformCommissionLabel')}
        name="platform_commission_percentage"
        type="number"
        min="0"
        max="100"
        step="0.01"
        postfix="%"
        requiredAsterisk
        helperText={t('platformCommissionHelper')}
      />
    </section>
  );
};
