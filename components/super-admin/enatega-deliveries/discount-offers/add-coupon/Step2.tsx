'use client';

import { getStep2Schema } from '@/schemas/enatega-deliveries/discount-offer/discount-offer-schema';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { Step2Data } from '@/types/entities/super-admin/enatega-deliveries/discount-coupons';
import { resolveCurrencySymbol } from '@/lib/formatCurrency';
import { useCurrency } from '@/hooks/use-currency';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { discountTypeValues } from './common/data';

export function Step2({
  initialData,
  onSubmit,
  onBack,
}: {
  initialData: Step2Data;
  onSubmit: (data: Step2Data) => void;
  onBack: () => void;
}) {
  const t = useTranslations('lumiFood.discountsOffers.addCoupon.step2');
  const tSchema = useTranslations('Schemas.discountOffer');
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
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>
      <Formik
        initialValues={initialData}
        onSubmit={onSubmit}
        validationSchema={getStep2Schema(tSchema)}
      >
        {({ handleSubmit, values }) => (
          <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                values.discountType === 'FIXED'
                  ? resolvedCurrencySymbol
                  : undefined
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
            <div className="flex justify-end gap-3 mt-10">
              <AppButton variant="secondary" onClick={onBack}>
                {t('backButton')}
              </AppButton>
              <AppButton type="submit">{t('saveNextButton')}</AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
