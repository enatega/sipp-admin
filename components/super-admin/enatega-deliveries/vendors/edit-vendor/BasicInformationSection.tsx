'use client';

import { useGetZonesSimple } from '@/hooks/api/super-admin/general/zones';
import { useTranslations } from 'next-intl';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppPhoneField } from '@/components/shared/form/AppPhoneInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { useFormikContext } from 'formik';
import { EditVendorFormValues } from '@/schemas/enatega-deliveries/vendor/vendor-form';

export const BasicInformationSection = () => {
  const t = useTranslations('lumiFood.vendors.editVendor.basicInfo');
  const { data: zones } = useGetZonesSimple();
  const { values, initialValues, setFieldValue } = useFormikContext<EditVendorFormValues>();

  const zoneOptions =
    zones?.map((zone) => ({
      key: zone.title,
      value: zone.id,
    })) || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {t('title')}
      </h2>
      <p className="text-sm text-gray-500 mb-6">{t('description')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInputField
          label={t('vendorNameLabel')}
          name="name"
          type="text"
          placeholder={t('vendorNamePlaceholder')}
          requiredAsterisk={Boolean(initialValues.name.trim())}
        />

        <AppInputField
          label={t('emailLabel')}
          name="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          requiredAsterisk={Boolean(initialValues.email.trim())}
          disabled
        />

        <AppPhoneField
          label={t('phoneLabel')}
          name="phone"
          placeholder={t('phonePlaceholder')}
          requiredAsterisk={Boolean(initialValues.phone.trim())}
        />
        
        <AppSelect
          label={t('zoneCityLabel')}
          name="zone_id"
          placeholder={t('zoneCityPlaceholder')}
          options={zoneOptions}
          value={values.zone_id}
          onValueChange={(value) => setFieldValue('zone_id', value)}
          requiredAsterisk={Boolean(initialValues.zone_id.trim())}
        />
      </div>
    </div>
  );
};
