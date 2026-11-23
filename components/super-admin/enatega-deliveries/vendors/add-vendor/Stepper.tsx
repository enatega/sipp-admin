'use client';

import { useVendorFormContext } from '@/contexts/super-admin/enatega-deliveries/vendors/vendor-form-context';
import { useTranslations } from 'next-intl';
import AppStepper from '@/components/shared/AppStepper';

export const VendorFormStepper = () => {
  const { currentStep } = useVendorFormContext();
  const t = useTranslations('lumiFood.vendors.addVendor.stepper');

  const steps = [
    {
      number: 1,
      title: t('basicInfoTitle'),
      description: t('basicInfoDescription'),
    },
    {
      number: 2,
      title: t('businessDocsTitle'),
      description: t('businessDocsDescription'),
    },
  ];

  return <AppStepper steps={steps} currentStep={currentStep} />;
};
