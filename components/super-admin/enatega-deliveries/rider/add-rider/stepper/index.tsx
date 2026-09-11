'use client';

import { useRiderFormContext } from '@/contexts/super-admin/enatega-deliveries/rider/rider-form-context';
import { useTranslations } from 'next-intl';
import AppStepper from '@/components/shared/AppStepper';

export const RiderFormStepper = () => {
  const { currentStep } = useRiderFormContext();
  const t = useTranslations('driverManagement.addDriver.stepper');

  const steps = [
    {
      number: 1,
      title: t('personalInfoTitle'),
      description: t('personalInfoDescription'),
    },
    {
      number: 2,
      title: t('documentSubmissionTitle'),
      description: t('documentSubmissionDescription'),
    },
    {
      number: 3,
      title: t('vehicleRequirementsTitle'),
      description: t('vehicleRequirementsDescription'),
    },
    {
      number: 4,
      title: t('codLimitSettingsTitle'),
      description: t('codLimitSettingsDescription'),
    },
  ];

  return <AppStepper steps={steps} currentStep={currentStep} />;
};
