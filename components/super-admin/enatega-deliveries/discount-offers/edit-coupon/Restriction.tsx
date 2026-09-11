'use client';

import { useTranslations } from 'next-intl';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';
import { AppSwitch } from '@/components/shared/form/AppSwitch';
import {
  deliveryTypeValues,
  paymentMethodValues,
} from '../add-coupon/common/data';

export function Restriction() {
  const t = useTranslations('lumiFood.discountsOffers.editCoupon.restriction');
  const tPaymentMethodOptions = useTranslations(
    'lumiFood.discountsOffers.options.paymentMethod',
  );
  const tDeliveryTypeOptions = useTranslations(
    'lumiFood.discountsOffers.options.deliveryType',
  );
  const paymentMethodOptions = paymentMethodValues.map((value) => ({
    key:
      value === 'CARD'
        ? tPaymentMethodOptions('card')
        : tPaymentMethodOptions('cod'),
    value,
  }));
  const deliveryTypeOptions = deliveryTypeValues.map((value) => ({
    key:
      value === 'ALL'
        ? tDeliveryTypeOptions('all')
        : value === 'DELIVERY'
          ? tDeliveryTypeOptions('delivery')
          : tDeliveryTypeOptions('pickup'),
    value,
  }));
  return (
    <div className="bg-white p-10 rounded-md shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <MultiSelect
          name="paymentMethod"
          label={t('paymentMethodLabel')}
          options={paymentMethodOptions}
          requiredAsterisk
          placeholder={t('paymentMethodPlaceholder')}
          className="shadow-sm mt-1"
        />

        <MultiSelect
          name="deliveryType"
          label={t('deliveryTypeLabel')}
          placeholder={t('deliveryTypePlaceholder')}
          options={deliveryTypeOptions}
          requiredAsterisk
          className="shadow-sm mt-1"
        />
        <div className="flex items-center gap-10">
          <AppSwitch name="forNewUserOnly" label={t('forNewUserOnlyLabel')} />
          {/* {showPremiumShops && (
            <AppSwitch
              name="forPremiumShopOnly"
              label={t('forPremiumShopOnlyLabel')}
            />
          )} */}
        </div>
        {/* {showPremiumShops && (
          <AppSelect
            name="premiumShop"
            label={t('premiumShopLabel')}
            placeholder={t('premiumShopPlaceholder')}
            options={premiumShopsOptions}
          />
        )} */}
      </div>
    </div>
  );
}
