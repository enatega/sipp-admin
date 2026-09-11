'use client';

import * as React from 'react';
import { StoreFormStep3Schema } from '@/schemas/enatega-deliveries/stores/store-form';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import type { Step3Data } from '@/types/entities/super-admin/enatega-deliveries/store-form';
import { useCurrency } from '@/hooks/use-currency';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSwitch } from '@/components/shared/form/AppSwitch';
import { getEmptyStep3 } from './data';

interface Step3FormProps {
  initialData: Step3Data | null;
  onSubmit: (data: Step3Data) => void;
  onBack: () => void;
}

export const Step3Form: React.FC<Step3FormProps> = ({
  initialData,
  onSubmit,
  onBack,
}) => {
  const t = useTranslations('lumiFood.stores.addStore.step3');
  const tSchema = useTranslations('Schemas.storeForm');
  const { currencySymbol } = useCurrency();

  const initialValues = React.useMemo<Step3Data>(
    () => initialData ?? getEmptyStep3(),
    [initialData],
  );

  const handleSubmit = (values: Step3Data) => {
    onSubmit(values);
  };

  return (
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={StoreFormStep3Schema(tSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
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
            <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
              <AppButton
                type="button"
                variant="secondary"
                onClick={onBack}
                className="px-8 h-10 rounded-[12px]"
              >
                {t('backButton')}
              </AppButton>
              <AppButton
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="px-8 h-10 rounded-[12px]"
              >
                {t('saveNextButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
