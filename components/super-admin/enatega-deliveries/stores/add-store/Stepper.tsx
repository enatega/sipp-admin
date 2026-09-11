'use client';

import { useTranslations } from 'next-intl';
import AppStepper from '@/components/shared/AppStepper';

interface StoreFormStepperProps {
  currentStep: number;
}

const StoreFormStepper = ({ currentStep }: StoreFormStepperProps) => {
  const t = useTranslations('lumiFood.stores.addStore.stepper');

  const steps = [
    {
      number: 1,
      title: t('storeInfoTitle'),
      description: t('storeInfoDescription'),
    },
    {
      number: 2,
      title: t('shopTypeTitle'),
      description: t('shopTypeDescription'),
    },
    {
      number: 3,
      title: t('locationTitle'),
      description: t('locationDescription'),
    },
    {
      number: 4,
      title: t('documentsTitle'),
      description: t('documentsDescription'),
    },
    {
      number: 5,
      title: t('bankDetailsTitle'),
      description: t('bankDetailsDescription'),
    },
  ];

  return <AppStepper steps={steps} currentStep={currentStep} />;
};

export default StoreFormStepper;
