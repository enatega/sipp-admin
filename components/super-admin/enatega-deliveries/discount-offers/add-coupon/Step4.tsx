'use client';

import { getStep4Schema } from '@/schemas/enatega-deliveries/discount-offer/discount-offer-schema';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { Step4Data } from '@/types/entities/super-admin/enatega-deliveries/discount-coupons';
import { AppButton } from '@/components/shared/AppButton';
import { AppDateTimeInput } from '@/components/shared/form/AppDateTimeInput';
import { AppSwitch } from '@/components/shared/form/AppSwitch';

export function Step4({
  initialData,
  onSubmit,
  onBack,
}: {
  initialData: Step4Data;
  onSubmit: (data: Step4Data) => void;
  onBack: () => void;
}) {
  const t = useTranslations('lumiFood.discountsOffers.addCoupon.step4');
  const tSchema = useTranslations('Schemas.discountOffer');
  return (
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>
      <Formik
        initialValues={initialData}
        validationSchema={getStep4Schema(tSchema)}
        onSubmit={onSubmit}
      >
        {({ handleSubmit, values }) => (
          <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AppSwitch name="activeImmediately" label="Active Immediately" />
            <AppDateTimeInput
              name="startDate"
              label={t('startDateLabel')}
              placeholder={t('startDatePlaceholder')}
              requiredAsterisk
              disabled={values.activeImmediately}
            />
            <AppDateTimeInput
              name="endDate"
              label={t('endDateLabel')}
              placeholder={t('endDatePlaceholder')}
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
