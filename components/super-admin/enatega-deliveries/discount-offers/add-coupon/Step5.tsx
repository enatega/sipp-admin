'use client';

import { getStep5Schema } from '@/schemas/enatega-deliveries/discount-offer/discount-offer-schema';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { Step5Data } from '@/types/entities/super-admin/enatega-deliveries/discount-coupons';
import { AppButton } from '@/components/shared/AppButton';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppSwitch } from '@/components/shared/form/AppSwitch';
import {
  deliveryTypeOptions,
  paymentMethodOptions,
  premiumShopsOptions,
} from './common/data';

const SELECT_ALL_VALUE = '__all__';
export function Step5({
  initialData,
  onSubmit,
  isSubmitting,
  onBack,
  showPremiumShops = false,
}: {
  initialData: Step5Data;
  onSubmit: (data: Step5Data) => void;
  onBack: () => void;
  isSubmitting: boolean;
  showPremiumShops?: boolean;
}) {
  const t = useTranslations('lumiFood.discountsOffers.addCoupon.step5');
  const tSchema = useTranslations('Schemas.discountOffer');
  const localizedPaymentMethodOptions = paymentMethodOptions.map((option) => ({
    ...option,
    key:
      option.value === 'CARD' ? t('paymentMethodCard') : t('paymentMethodCod'),
  }));
  const localizedDeliveryTypeOptions = deliveryTypeOptions.map((option) => ({
    ...option,
    key:
      option.value === 'DELIVERY'
        ? t('deliveryTypeDelivery')
        : t('deliveryTypePickup'),
  }));
  const paymentMethodOptionsWithAll = [
    { key: t('selectAll'), value: SELECT_ALL_VALUE },
    ...localizedPaymentMethodOptions,
  ];

  const deliveryTypeOptionsWithAll = [
    { key: t('selectAll'), value: SELECT_ALL_VALUE },
    ...localizedDeliveryTypeOptions,
  ];
  return (
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>
      <Formik
        enableReinitialize
        validationSchema={getStep5Schema(tSchema)}
        initialValues={initialData}
        onSubmit={onSubmit}
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <MultiSelect
              name="paymentMethod"
              label={t('paymentMethodLabel')}
              options={paymentMethodOptionsWithAll}
              selected={values.paymentMethod ?? []}
              onChange={(selectedKeys) => {
                const allValues = paymentMethodOptions.map((opt) => opt.value);

                if (selectedKeys.includes(SELECT_ALL_VALUE)) {
                  const isAllSelected = allValues.every((val) =>
                    selectedKeys.includes(val),
                  );

                  setFieldValue(
                    'paymentMethod',
                    isAllSelected ? [] : allValues,
                  );
                } else {
                  setFieldValue('paymentMethod', selectedKeys);
                }
              }}
              placeholder={t('paymentMethodPlaceholder')}
              className="shadow-sm mt-1"
            />

            <MultiSelect
              name="deliveryType"
              label={t('deliveryTypeLabel')}
              options={deliveryTypeOptionsWithAll}
              selected={values.deliveryType ?? []}
              onChange={(selectedKeys) => {
                const allValues = deliveryTypeOptions.map((opt) => opt.value);

                if (selectedKeys.includes(SELECT_ALL_VALUE)) {
                  const isAllSelected = allValues.every((val) =>
                    selectedKeys.includes(val),
                  );

                  setFieldValue('deliveryType', isAllSelected ? [] : allValues);
                } else {
                  setFieldValue('deliveryType', selectedKeys);
                }
              }}
              placeholder={t('deliveryTypePlaceholder')}
              className="shadow-sm mt-1"
            />
            <div className="flex items-center gap-10">
              <AppSwitch
                name="forNewUserOnly"
                label={t('forNewUserOnlyLabel')}
              />
              {showPremiumShops && (
                <AppSwitch
                  name="forPremiumShopOnly"
                  label={t('forPremiumShopOnlyLabel')}
                />
              )}
            </div>

            {showPremiumShops && (
              <AppSelect
                name="premiumShop"
                label={t('premiumShopLabel')}
                placeholder={t('premiumShopPlaceholder')}
                options={premiumShopsOptions}
              />
            )}

            <div className="flex justify-end gap-3 mt-10">
              <AppButton variant="secondary" onClick={onBack}>
                {t('backButton')}
              </AppButton>
              <AppButton
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {t('saveNextButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
