'use client';

import { useTranslations } from 'next-intl';
import { AppInputField } from '@/components/shared/form/AppInput';

export function BasicInformation() {
  const t = useTranslations('lumiFood.discountsOffers.editCoupon.basicInformation');

  return (
    <div className="bg-white p-10 rounded-md shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <AppInputField
          label={t('couponNameLabel')}
          name="couponName"
          type="text"
          placeholder={t('couponNamePlaceholder')}
          requiredAsterisk
        />

        <AppInputField
          label={t('couponCodeLabel')}
          name="couponCode"
          type="text"
          placeholder={t('couponCodePlaceholder')}
          requiredAsterisk
        />

        <AppInputField
          label={t('couponDescriptionLabel')}
          name="couponDescription"
          type="text"
          placeholder={t('couponDescriptionPlaceholder')}
          requiredAsterisk
        />
      </div>
    </div>
  );
}
