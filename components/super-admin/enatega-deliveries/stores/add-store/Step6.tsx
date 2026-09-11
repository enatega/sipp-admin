import * as React from 'react';
import { step6Schema } from '@/schemas/enatega-deliveries/stores/store-form';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { Step6Data } from '@/types/entities/super-admin/enatega-deliveries/store-form';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { emptyStep6Data } from './data';

interface Step6FormProps {
  initialData: Step6Data | null;
  onSubmit: (data: Step6Data) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function Step6Form({ initialData, onSubmit, onBack, isLoading = false }: Step6FormProps) {
  const t = useTranslations('lumiFood.stores.addStore.step6');
  const tSchema = useTranslations('Schemas.storeForm');
  const initialValues = React.useMemo<Step6Data>(
    () => initialData ?? emptyStep6Data,
    [initialData],
  );

  const handleSubmit = (values: Step6Data, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    onSubmit(values);
    setSubmitting(false);
  };

  return (
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <div>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={step6Schema(tSchema)}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-4">
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

              <div className="flex justify-end gap-x-5 mt-10">
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={onBack}
                  className="w-fit"
                >
                  {t('backButton')}
                </AppButton>
                <AppButton
                  type="submit"
                  className="w-fit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? t('publishLoading') : t('publishButton')}
                </AppButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
