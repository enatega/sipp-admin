'use client';

import * as React from 'react';
import { Step5Schema } from '@/schemas/enatega-deliveries/stores/store-form';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import type { Step5Data } from '@/types/entities/super-admin/enatega-deliveries/store-form';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { getEmptyStep5, Step5Lables } from './data';

export const SharedStep5Form = ({
  initialData,
  onSubmit,
  onBack,
  translationNamespace,
}: {
  initialData: Step5Data | null;
  onSubmit: (data: Step5Data) => void;
  onBack: () => void;
  translationNamespace: string;
}) => {
  const t = useTranslations(`${translationNamespace}.step5`);
  const tSchema = useTranslations('Schemas.storeForm');

  const initialValues = React.useMemo<Step5Data>(
    () => initialData ?? getEmptyStep5(),
    [initialData],
  );

  const handleSubmit = (values: Step5Data) => {
    onSubmit(values);
  };

  return (
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <div className="my-5">
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={Step5Schema(tSchema)}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Step5Lables.map((field) => (
                  <AppFileInput
                    key={field.name}
                    name={field.name}
                    label={t(`fields.${field.labelKey}`)}
                    requiredAsterisk
                  />
                ))}
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
    </div>
  );
};
