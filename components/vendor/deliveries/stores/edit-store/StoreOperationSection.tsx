import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSwitch } from '@/components/shared/form/AppSwitch';

export function StoreOperationSection() {
  const t = useTranslations('vendorDeliveriesStores.addStore.step3');
  const { currencySymbol } = useCurrency();

  return (
    <div className="p-10 bg-white rounded-xl shadow space-y-5">
      <div className="mb-10 space-y-2">
        <h3 className="text-2xl font-semibold ">{t('title')}</h3>
        <p className="text-mute text-sm">
          {t('description')}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <AppInputField
          label={t('prepareTimeLabel')}
          name="prepareTime"
          type="text"
          placeholder={t('prepareTimePlaceholder')}
          requiredAsterisk
        />
        <AppInputField
          label={t('packingChargesLabel')}
          name="packingCharges"
          type="text"
          placeholder={`${currencySymbol} 0.75`}
          requiredAsterisk
        />
        <AppInputField
          label={t('baseFeeLabel')}
          name="baseFee"
          type="text"
          placeholder={t('baseFeePlaceholder')}
          requiredAsterisk
        />
        <AppInputField
          label={t('perKmFeeLabel')}
          name="perKmFee"
          type="text"
          placeholder={t('perKmFeePlaceholder')}
          requiredAsterisk
        />
        <AppInputField
          label={t('freeDeliveryThresholdLabel')}
          name="freeDeliveryThreshold"
          type="text"
          placeholder={t('freeDeliveryThresholdPlaceholder')}
          requiredAsterisk
        />
      </div>

      {/* Order Methods */}
      <div className="p-4 border rounded-lg space-y-3">
        <p className="font-medium">{t('orderMethodLabel')}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm">{t('scheduleBooking')}</span>
          <AppSwitch name="scheduleBooking" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{t('pickupAllowed')}</span>
          <AppSwitch name="pickupAllowed" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{t('deliveryAllowed')}</span>
          <AppSwitch name="deliveryAllowed" />
        </div>
      </div>
    </div>
  );
}
