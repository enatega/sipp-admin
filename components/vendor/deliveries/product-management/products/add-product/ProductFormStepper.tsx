'use client';

import { useProductFormContext } from '@/contexts/vendor/deliveries/product-management/product-form-context';
import { useTranslations } from 'next-intl';
import AppStepper from '@/components/shared/AppStepper';

const ProductFormStepper = () => {
  const { currentStep } = useProductFormContext();
  const t = useTranslations('products.addProduct.stepper');

  const steps = [
    {
      number: 1,
      title: t('basicInfoTitle'),
      description: t('basicInfoDescription'),
    },
    {
      number: 2,
      title: t('variantsTitle'),
      description: t('variantsDescription'),
    },
  ];

  return <AppStepper steps={steps} currentStep={currentStep} />;
};

export default ProductFormStepper;

