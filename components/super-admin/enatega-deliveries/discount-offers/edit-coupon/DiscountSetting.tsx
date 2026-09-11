'use client';

import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { EditCouponFormData } from '@/types/entities/super-admin/enatega-deliveries/discount-coupons';
import { resolveCurrencySymbol } from '@/lib/formatCurrency';
import { useCurrency } from '@/hooks/use-currency';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { discountTypeValues } from '../add-coupon/common/data';

export function DiscountSetting() {
  const t = useTranslations(
    'lumiFood.discountsOffers.editCoupon.discountSetting',
  );
  const { values } = useFormikContext<EditCouponFormData>();
  const { currencySymbol, currencyCode } = useCurrency();
  const resolvedCurrencySymbol = resolveCurrencySymbol(
    currencySymbol || currencyCode || '$',
  );
  const discountTypeOptions = discountTypeValues.map((value) => ({
    key:
      value === 'PERCENTAGE'
        ? t('discountTypePercentage')
        : t('discountTypeFixed'),
    value,
  }));

  return (
    <div className="bg-white p-10 rounded-md shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <AppSelect
          name="discountType"
          label={t('discountTypeLabel')}
          placeholder={t('discountTypePlaceholder')}
          options={discountTypeOptions}
          requiredAsterisk
        />
        <AppInputField
          name="discountValue"
          label={
            values.discountType === 'PERCENTAGE'
              ? t('discountValueLabelPercentage')
              : t('discountValueLabelWithCurrency', {
                  currency: resolvedCurrencySymbol,
                })
          }
          placeholder={t('discountValuePlaceholder')}
          type="number"
          min={0}
          prefix={
            values.discountType === 'FIXED' ? resolvedCurrencySymbol : undefined
          }
          postfix={values.discountType === 'PERCENTAGE' ? '%' : undefined}
          requiredAsterisk
        />
        {values.discountType === 'PERCENTAGE' && (
          <AppInputField
            name="maxDiscountCap"
            label={t('maxDiscountCapLabelWithCurrency', {
              currency: resolvedCurrencySymbol,
            })}
            placeholder={t('maxDiscountCapPlaceholder')}
            type="number"
            min={0}
            prefix={resolvedCurrencySymbol}
          />
        )}
        <AppInputField
          name="minOrderValue"
          label={t('minOrderValueLabelWithCurrency', {
            currency: resolvedCurrencySymbol,
          })}
          placeholder={t('minOrderValuePlaceholder')}
          type="number"
          min={0}
          prefix={resolvedCurrencySymbol}
          requiredAsterisk
        />
        <AppInputField
          name="totalUsageLimit"
          label={t('totalUsageLimitLabel')}
          placeholder={t('totalUsageLimitPlaceholder')}
          type="number"
          min={1}
          requiredAsterisk
        />
      </div>
    </div>
  );
}
