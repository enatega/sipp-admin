'use client';

import { getStep1Schema } from '@/schemas/enatega-deliveries/discount-offer/discount-offer-schema';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { Step1Data } from '@/types/entities/super-admin/enatega-deliveries/discount-coupons';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';

export function Step1({
  initialData,
  onSubmit,
}: {
  initialData: Step1Data;
  onSubmit: (data: Step1Data) => void;
}) {
  const t = useTranslations('lumiFood.discountsOffers.addCoupon.step1');
  const tSchema = useTranslations('Schemas.discountOffer');
  return (
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('title')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('description')}
        </p>
      </div>
      <Formik
        initialValues={initialData}
        enableReinitialize
        validationSchema={getStep1Schema(tSchema)}
        onSubmit={onSubmit}
      >
        {({ isSubmitting, resetForm }) => (
          <Form className="flex flex-col gap-4">
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

            <div className="flex items-center justify-end gap-3 pt-4 mt-6">
              <AppButton
                type="button"
                variant="secondary"
                className="px-8 h-10 rounded-[12px]"
                onClick={() => resetForm()}
              >
                {t('clearButton')}
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
}
