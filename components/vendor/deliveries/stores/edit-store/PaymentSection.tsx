import { useTranslations } from 'next-intl';
import { AppInputField } from '@/components/shared/form/AppInput';

export function PaymentSection() {
  const t = useTranslations('lumiFood.stores.addStore.step6');

  return (
    <div className="space-y-5 rounded-xl bg-white p-10 shadow">
      <div className="mb-5 space-y-2">
        <h3 className="text-2xl font-semibold">{t('title')}</h3>
        <p className="text-sm text-mute">{t('description')}</p>
      </div>

      <div className="space-y-5 pt-3">
        <AppInputField
          label={t('bankNameLabel')}
          name="bankName"
          placeholder={t('bankNamePlaceholder')}
          requiredAsterisk
        />
        <AppInputField
          label={t('accountHolderNameLabel')}
          name="accountHolderName"
          placeholder={t('accountHolderNamePlaceholder')}
          requiredAsterisk
        />
        <AppInputField
          label={t('accountNumberLabel')}
          name="accountNumber"
          placeholder={t('accountNumberPlaceholder')}
          requiredAsterisk
        />
        <AppInputField
          label={t('branchCodeLabel')}
          name="branchCode"
          placeholder={t('branchCodePlaceholder')}
        />
      </div>
    </div>
  );
}
