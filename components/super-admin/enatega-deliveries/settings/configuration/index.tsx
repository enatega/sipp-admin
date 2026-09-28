'use client';

import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY,
} from '@/constants/currency.constants';
import {
  useGetActiveCurrency,
  useSaveCurrency,
} from '@/hooks/api/super-admin/general/currency';
import { handleApiError } from '@/lib/toast-error';
import { ApiErrorResponse } from '@/types';
import {
  configurationSchema,
  type ConfigurationFormValues,
} from '@/schemas/enatega-deliveries/settings/configuration.schema';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';

const INITIAL_VALUES: ConfigurationFormValues = {
  currencyCode: DEFAULT_CURRENCY.code,
  currencySymbol: DEFAULT_CURRENCY.symbol,
  usdConversionRate: '',
};

export function ConfigurationForm() {
  const t = useTranslations('settings.configuration');
  const tUsdRate = useTranslations(
    'settings.configuration.fields.usdConversionRate',
  );
  const tValidation = useTranslations('settings.configuration.validation');
  const { data: activeCurrency } = useGetActiveCurrency();
  const { mutateAsync: saveCurrency, isPending: isSaving } = useSaveCurrency();

  const initialValues: ConfigurationFormValues = {
    currencyCode: activeCurrency?.code ?? INITIAL_VALUES.currencyCode,
    currencySymbol: activeCurrency?.symbol ?? INITIAL_VALUES.currencySymbol,
    usdConversionRate:
      activeCurrency?.code === 'USD'
        ? 1
        : (activeCurrency?.usdConversionRate ??
          INITIAL_VALUES.usdConversionRate),
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-2">
        {t('sectionTitle')}
      </h3>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={configurationSchema(tValidation)}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const selectedCurrency = CURRENCY_OPTIONS.find(
              (currency) => currency.value === values.currencyCode,
            );

            await saveCurrency({
              code: values.currencyCode,
              name: selectedCurrency?.label || values.currencyCode,
              symbol: values.currencySymbol,
              usdConversionRate: Number(values.usdConversionRate),
            });

            toast.success(t('toasts.submitSuccess'));
          } catch (error) {
            handleApiError(error as ApiErrorResponse);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, dirty, setFieldValue, values }) => (
          <Form>
            <section className="rounded-xl border bg-white p-4">
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <AppSelect
                  name="currencyCode"
                  label={t('fields.currencyCode.label')}
                  placeholder={t('fields.currencyCode.placeholder')}
                  options={CURRENCY_OPTIONS.map((currency) => ({
                    key: `${currency.label} (${currency.value})`,
                    value: currency.value,
                  }))}
                  onValueChange={(value) => {
                    const selectedCurrency = CURRENCY_OPTIONS.find(
                      (currency) => currency.value === value,
                    );
                    setFieldValue(
                      'currencySymbol',
                      selectedCurrency?.symbol ?? '',
                    );
                    if (value === 'USD') {
                      setFieldValue('usdConversionRate', 1);
                    } else if (value !== values.currencyCode) {
                      setFieldValue('usdConversionRate', '');
                    }
                  }}
                  requiredAsterisk
                />

                <AppInputField
                  name="currencySymbol"
                  label={t('fields.currencySymbol.label')}
                  placeholder={t('fields.currencySymbol.placeholder')}
                  disabled
                  requiredAsterisk
                />

                <AppInputField
                  name="usdConversionRate"
                  type="number"
                  min="0.000001"
                  max="1000000000"
                  step="0.000001"
                  inputMode="decimal"
                  label={tUsdRate('label', {
                    currencyCode: values.currencyCode,
                  })}
                  placeholder={tUsdRate('placeholder')}
                  helperText={tUsdRate('helper', {
                    currencyCode: values.currencyCode,
                  })}
                  disabled={values.currencyCode === 'USD'}
                  postfix={values.currencyCode}
                  requiredAsterisk
                />
              </div>

              <div className="mt-5 flex justify-end">
                <AppButton
                  type="submit"
                  isLoading={isSubmitting || isSaving}
                  disabled={isSubmitting || isSaving || !dirty}
                  className="px-8"
                >
                  {t('submitButton')}
                </AppButton>
              </div>
            </section>
          </Form>
        )}
      </Formik>
    </div>
  );
}
