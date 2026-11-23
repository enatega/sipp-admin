'use client';

import { useTranslations } from 'next-intl';
import AppStepper from '@/components/shared/AppStepper';

interface discountFormStepper {
  currentStep: number;
}

export function Stepper({ currentStep }: discountFormStepper) {
  const t = useTranslations('lumiFood.discountsOffers.addCoupon.stepper');
  const steps = [
    {
      number: 1,
      title: t('step1Title'),
      description: t('step1Description'),
    },
    {
      number: 2,
      title: t('step2Title'),
      description: t('step2Description'),
    },
    {
      number: 3,
      title: t('step3Title'),
      description: t('step3Description'),
    },
    {
      number: 4,
      title: t('step4Title'),
      description: t('step4Description'),
    },
    {
      number: 5,
      title: t('step5Title'),
      description: t('step5Description'),
    },
  ];

  return <AppStepper steps={steps} currentStep={currentStep} />;
}
