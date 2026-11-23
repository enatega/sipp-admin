'use client';

import { useParams } from 'next/navigation';
import { useProductFormContext } from '@/contexts/store/deliveries/product-management/product-form-context';
import { Step1Form } from './steps/Step1';
import { Step2Form } from './steps/step2/Step2';
import { useProductSkuSuggestion } from './useProductSkuSuggestion';

const ProductForm = () => {
  const { currentStep } = useProductFormContext();
  const { storeId } = useParams() as { storeId?: string };
  // Asked here, above both steps, so moving between them never asks again.
  const suggestedSku = useProductSkuSuggestion({ storeId, enabled: !!storeId });

  return (
    <div className="flex-1">
      {currentStep === 1 ? (
        <Step1Form suggestedSku={suggestedSku} />
      ) : currentStep === 2 ? (
        <Step2Form suggestedSku={suggestedSku} />
      ) : null}
    </div>
  );
};

export default ProductForm;
