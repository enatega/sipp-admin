'use client';

import * as React from 'react';
import {
  useVendorFormContext,
  VendorStep1Data,
} from '@/contexts/super-admin/enatega-deliveries/vendors/vendor-form-context';
import { VendorFormStep1Schema } from '@/schemas/enatega-deliveries/vendor/vendor-form';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { useGetZonesSimple } from '@/hooks/api/super-admin/general/zones';
import { generatePassword } from '@/lib/utils';
import { AppButton } from '@/components/shared/AppButton';
import { AppCheckBox } from '@/components/shared/form/AppCheckBox';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppPasswordField } from '@/components/shared/form/AppPasswordField';
import { AppPhoneField } from '@/components/shared/form/AppPhoneInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppSwitch } from '@/components/shared/form/AppSwitch';
import { EMPTY_STEP1 } from './data';

export const Step1Form = () => {
  const { nextStep, setStep1Data, formData } = useVendorFormContext();
  const t = useTranslations('lumiFood.vendors.addVendor.step1');
  const tSchema = useTranslations();

  const { data: zones } = useGetZonesSimple();

  const zoneOptions =
    zones?.map((zone) => ({
      key: zone.title,
      value: zone.id,
    })) || [];

  const initialValues = React.useMemo<VendorStep1Data>(
    () => formData.step1 ?? EMPTY_STEP1,
    [formData.step1],
  );

  const handleSubmit = (values: VendorStep1Data) => {
    setStep1Data(values);
    nextStep();
  };

  return (
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={VendorFormStep1Schema(tSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="space-y-4">
            <AppInputField
              label={t('vendorNameLabel')}
              name="name"
              type="text"
              placeholder={t('vendorNamePlaceholder')}
              requiredAsterisk
            />

            <AppInputField
              label={t('emailLabel')}
              name="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              requiredAsterisk
            />

            <AppPhoneField
              label={t('phoneLabel')}
              name="phone"
              placeholder={t('phonePlaceholder')}
              requiredAsterisk
            />
            
            <AppSelect
              label={t('zoneCityLabel')}
              name="zone_id"
              placeholder={t('zoneCityPlaceholder')}
              options={zoneOptions}
              value={values.zone_id}
              onValueChange={(value) => setFieldValue('zone_id', value)}
              requiredAsterisk
            />

            <AppPasswordField
              label={t('passwordLabel')}
              name="password"
              placeholder={t('passwordPlaceholder')}
              requiredAsterisk
              disabled={values.autoGeneratePassword}
            />

            <div className="flex gap-x-20 items-center my-5">
              <AppCheckBox
                name="autoGeneratePassword"
                label={t('autoGeneratePasswordLabel')}
                onChange={(checked) => {
                  if (checked) {
                    const generated = generatePassword(12);
                    setFieldValue('password', generated);
                    return;
                  }

                  setFieldValue('password', '');
                }}
              />

              <AppCheckBox
                name="mailLoginCredentials"
                label={t('sendLoginCredentialsLabel')}
              />
            </div>

            <AppSwitch
              name="changePasswordAllowed"
              label={t('allowVendorPasswordChangeLabel')}
            />

            <div className="flex items-end justify-end">
              <AppButton
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="px-12 h-10 rounded-[12px] mt-6"
              >
                {t('nextButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
