'use client';

import { useProductFormContext } from '@/contexts/vendor/deliveries/product-management/product-form-context';
import { Step1Form } from './steps/Step1';
import { Step2Form } from './steps/step2/Step2';
import { useVendorProductSku } from './useVendorProductSku';

const ProductForm = () => {
  const { currentStep } = useProductFormContext();
  // Asked here, above both steps, so moving between them never asks again.
  const { suggestedSku, skuStoreId } = useVendorProductSku();

  return (
    <div className="flex-1">
      {currentStep === 1 ? (
        <Step1Form suggestedSku={suggestedSku} skuStoreId={skuStoreId} />
      ) : currentStep === 2 ? (
        <Step2Form suggestedSku={suggestedSku} skuStoreId={skuStoreId} />
      ) : null}
    </div>
  );
};

export default ProductForm;
