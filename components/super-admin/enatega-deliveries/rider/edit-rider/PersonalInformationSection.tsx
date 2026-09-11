'use client';

import { AppInputField } from '@/components/shared/form/AppInput';
import { AppPasswordField } from '@/components/shared/form/AppPasswordField';
import { AppPhoneField } from '@/components/shared/form/AppPhoneInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { useTranslations } from 'next-intl';
import { ZoneSimpleItem } from '@/types';

interface PersonalInformationSectionProps {
  zones?: ZoneSimpleItem[];
}

export const PersonalInformationSection = ({
  zones,
}: PersonalInformationSectionProps) => {
  const t = useTranslations('driverManagement.editDriver');
  const tAddStep1 = useTranslations('driverManagement.addDriver.step1');
  const zoneOptions = zones?.map((zone) => ({
    key: zone.title,
    value: zone.id,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {t('personalInfoTitle')}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {t('personalInfoDescription')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          label={tAddStep1('passwordLabel')}
          name="password"
          placeholder={tAddStep1('passwordPlaceholder')}
        />

        <AppPasswordField
          label={tAddStep1('confirmPasswordLabel')}
          name="confirm_password"
          placeholder={tAddStep1('confirmPasswordPlaceholder')}
        />

        <AppSelect
          label={t('zoneLabel')}
          name="zone_id"
          placeholder={t('zonePlaceholder')}
          options={zoneOptions || []}
          requiredAsterisk
        />
      </div>
    </div>
  );
};
