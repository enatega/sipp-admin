'use client';

import { useProductFormContext } from '@/contexts/vendor/deliveries/product-management/product-form-context';
import { Step1Form } from './steps/Step1';
import { Step2Form } from './steps/step2/Step2';

const ProductForm = () => {
  const { currentStep } = useProductFormContext();

  return (
    <div className="flex-1">
      {currentStep === 1 ? (
        <Step1Form />
      ) : currentStep === 2 ? (
        <Step2Form />
      ) : null}
    </div>
  );
};

export default ProductForm;

