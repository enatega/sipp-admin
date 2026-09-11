'use client';

import * as React from 'react';
import { VendorStoreFormStep1Schema } from '@/schemas/enatega-deliveries/stores/store-form';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import type { VendorStep1Data } from '@/types/entities/vendor/store';
import { useGetZonesSimple } from '@/hooks/api/common/zones';
import { generatePassword } from '@/lib/utils';
import { AppButton } from '@/components/shared/AppButton';
import { AppCheckBox } from '@/components/shared/form/AppCheckBox';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppPasswordField } from '@/components/shared/form/AppPasswordField';
import { AppPhoneField } from '@/components/shared/form/AppPhoneInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppSwitch } from '@/components/shared/form/AppSwitch';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import {
  EMPTY_VENDOR_STEP1,
  minimumOrderOptions,
} from './data';

interface Step1FormProps {
  initialData: VendorStep1Data | null;
  onSubmit: (data: VendorStep1Data) => void;
}

const AutoGeneratePasswordEffect: React.FC<{
  autoGeneratePassword?: boolean;
  currentPassword?: string;
  setFieldValue: (field: string, value: string) => void;
}> = ({ autoGeneratePassword, currentPassword, setFieldValue }) => {
  React.useEffect(() => {
    if (autoGeneratePassword && !currentPassword) {
      const newPassword = generatePassword(12);
      setFieldValue('password', newPassword);
    }
  }, [autoGeneratePassword, currentPassword, setFieldValue]);

  return null;
};

export const Step1Form: React.FC<Step1FormProps> = ({
  initialData,
  onSubmit,
}) => {
  const t = useTranslations('vendorDeliveriesStores.addStore.step1');
  const tSchema = useTranslations('Schemas.storeForm');
  const { data: zones, isLoading: isLoadingZones } = useGetZonesSimple();

  const zoneOptions =
    zones?.map((zone) => ({
      key: zone.title,
      value: zone.id,
    })) || [];

  const initialValues = React.useMemo<VendorStep1Data>(
    () => initialData ?? EMPTY_VENDOR_STEP1,
    [initialData],
  );

  const handleSubmit = (values: VendorStep1Data) => {
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
        validationSchema={VendorStoreFormStep1Schema(tSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="space-y-4" autoComplete="off">
            <AutoGeneratePasswordEffect
              autoGeneratePassword={values.autoGeneratePassword}
              currentPassword={values.password}
              setFieldValue={setFieldValue}
            />
            <AppInputField
              label={t('storeNameLabel')}
              name="name"
              type="text"
              placeholder={t('storeNamePlaceholder')}
              requiredAsterisk
            />
            {/* No vendor selection field for vendor */}
            <AppPhoneField
              label={t('phoneLabel')}
              name="phone"
              placeholder={t('phonePlaceholder')}
              requiredAsterisk
            />
            <AppFileInput
              name="logo"
              label={t('logoLabel')}
              requiredAsterisk
              previewHeight={120}
            />
            <AppFileInput
              name="banner"
              label={t('bannerLabel')}
              previewHeight={120}
            />
            <AppInputField
              label={t('emailLabel')}
              name="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              autoComplete="off"
              autoCapitalize="none"
              requiredAsterisk
            />
            <AppPasswordField
              label={t('passwordLabel')}
              name="password"
              placeholder={t('passwordPlaceholder')}
              autoComplete="new-password"
              requiredAsterisk
              disabled={values.autoGeneratePassword}
            />
            <div className="flex gap-x-20 items-center my-5">
              <AppCheckBox
                name="autoGeneratePassword"
                label={t('autoGeneratePasswordLabel')}
                onChange={(checked) => {
                  if (checked) {
                    setFieldValue('password', generatePassword(12));
                    return;
                  }

                  setFieldValue('password', '');
                }}
              />

              <AppCheckBox
                name="mailLoginCredentials"
                label={t('mailLoginCredentialsLabel')}
              />
            </div>
            <AppSelect
              name="zoneId"
              label={t('zoneLabel')}
              placeholder={isLoadingZones ? t('loadingZones') : t('zonePlaceholder')}
              options={zoneOptions}
              value={values.zoneId}
              onValueChange={(value) => setFieldValue('zoneId', value)}
              requiredAsterisk
              disabled={isLoadingZones}
            />
            <AppSelect
              name="minimumOrderValue"
              label={t('minimumOrderLabel')}
              placeholder={t('minimumOrderPlaceholder')}
              options={minimumOrderOptions}
              value={values.minimumOrderValue}
              onValueChange={(value) =>
                setFieldValue('minimumOrderValue', value)
              }
              requiredAsterisk
            />
            <AppInputField
              label={t('tagLineLabel')}
              name="tagLine"
              type="text"
              placeholder={t('tagLinePlaceholder')}
            />
            <AppTextarea
              label={t('descriptionLabel')}
              name="description"
              placeholder={t('descriptionPlaceholder')}
              rows={3}
            />
            <AppTextarea
              label={t('addressLabel')}
              name="address"
              placeholder={t('addressPlaceholder')}
              rows={3}
              requiredAsterisk
            />

            <AppSwitch
              name="changePassword"
              label={t('changePasswordLabel')}
            />

            <div className="flex items-center justify-end gap-3 pt-4 mt-6">
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
