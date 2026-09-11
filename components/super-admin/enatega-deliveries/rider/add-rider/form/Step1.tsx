'use client';

import * as React from 'react';
import {
  RiderStep1Data,
  useRiderFormContext,
} from '@/contexts/super-admin/enatega-deliveries/rider/rider-form-context';
import { RiderFormStep1Schema } from '@/schemas/enatega-deliveries/riders/rider-form';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { handleApiError } from '@/lib/toast-error';
import { generatePassword } from '@/lib/utils';
import { useValidateRiderBasicInfo } from '@/hooks/api/super-admin/enatega-deliveries/riders';
import { useGetZonesSimple } from '@/hooks/api/super-admin/general/zones';
import { AppButton } from '@/components/shared/AppButton';
import { AppCheckBox } from '@/components/shared/AppCheckBox';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppPasswordField } from '@/components/shared/form/AppPasswordField';
import { AppPhoneField } from '@/components/shared/form/AppPhoneInput';
import { AppSelect } from '@/components/shared/form/AppSelect';

const EMPTY_STEP1: RiderStep1Data = {
  name: '',
  email: '',
  phone: '',
  zone_id: '',
  password: '',
  confirm_password: '',
  send_login_credentials_email: false,
};

export const Step1Form = () => {
  const t = useTranslations('driverManagement.addDriver.step1');
  const tZone = useTranslations('driverManagement.addDriver.zoneSelect');
  const { nextStep, setStep1Data, formData } = useRiderFormContext();
  const [autoGenerate, setAutoGenerate] = React.useState(false);
  const { data: zones, isLoading: isLoadingZones } = useGetZonesSimple();
  const { mutateAsync: validateBasicInfo, isPending: isValidating } =
    useValidateRiderBasicInfo();

  const availableZones =
    zones?.map((zone) => {
      return { key: zone.title, value: zone.id };
    }) || [];

  const initialValues = React.useMemo<RiderStep1Data>(
    () => formData.step1 ?? EMPTY_STEP1,
    [formData.step1],
  );

  const handleSubmit = async (values: RiderStep1Data) => {
    try {
      // Validate basic information with API
      await validateBasicInfo({
        name: values.name,
        email: values.email,
        password: values.password,
        phone_number: values.phone,
        city: values.zone_id, // Send the selected zone_id as city
        allow_password_change: values.send_login_credentials_email,
      });

      // If validation passes, save data and proceed
      setStep1Data(values);
      nextStep();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <h2 className="text-2xl font-semibold text-black mb-6">{t('title')}</h2>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={RiderFormStep1Schema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => {
          return (
            <Form className="space-y-4">
              <AppInputField
                label={t('fullNameLabel')}
                name="name"
                type="text"
                placeholder={t('fullNamePlaceholder')}
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
              <AppPasswordField
                label={t('passwordLabel')}
                name="password"
                placeholder={t('passwordPlaceholder')}
                requiredAsterisk
                disabled={autoGenerate}
              />
              {/* Auto generate checkbox */}
              <AppCheckBox
                name="auto_generate_password"
                label={t('autoGeneratePasswordLabel')}
                onChange={(checked) => {
                  const isChecked = !!checked;
                  setAutoGenerate(isChecked);

                  if (isChecked) {
                    const pwd = generatePassword();
                    setFieldValue('password', pwd);
                    setFieldValue('confirm_password', pwd);
                  } else {
                    setFieldValue('password', '');
                    setFieldValue('confirm_password', '');
                  }
                }}
                className="text-mute"
              />
              <AppPasswordField
                label={t('confirmPasswordLabel')}
                name="confirm_password"
                placeholder={t('confirmPasswordPlaceholder')}
                requiredAsterisk
                disabled={autoGenerate}
              />

              <AppSelect
                label={tZone('label')}
                name="zone_id"
                placeholder={tZone('placeholder')}
                options={availableZones}
                loading={isLoadingZones}
                requiredAsterisk
              />

              <AppCheckBox
                name="send_login_credentials_email"
                label={t('sendLoginCredentialsEmailLabel')}
              />

              <div className="flex justify-end">
                <AppButton
                  type="submit"
                  isLoading={isSubmitting || isValidating}
                  disabled={isSubmitting || isValidating}
                  className="px-12 h-10 rounded-[12px] mt-6"
                >
                  {t('nextButton')}
                </AppButton>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
