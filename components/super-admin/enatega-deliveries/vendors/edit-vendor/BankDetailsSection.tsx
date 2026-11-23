'use client';

import { useTranslations } from 'next-intl';
import { AppInputField } from '@/components/shared/form/AppInput';

export const BankDetailsSection = () => {
  const t = useTranslations('lumiFood.vendors.editVendor.bankDetails');

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('title')}</h2>

      <p className="text-sm text-gray-500 mb-6">{t('description')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInputField
          label={t('bankNameLabel')}
          name="bank_name"
          placeholder={t('bankNamePlaceholder')}
          requiredAsterisk
        />

        <AppInputField
          label={t('branchCodeLabel')}
          name="branch_code"
          placeholder={t('branchCodePlaceholder')}
          requiredAsterisk
        />

        <AppInputField
          label={t('accountTitleLabel')}
          name="account_title"
          placeholder={t('accountTitlePlaceholder')}
          requiredAsterisk
        />

        <AppInputField
          label={t('accountNumberLabel')}
          name="account_number"
          placeholder={t('accountNumberPlaceholder')}
          requiredAsterisk
        />
      </div>
    </div>
  );
};
