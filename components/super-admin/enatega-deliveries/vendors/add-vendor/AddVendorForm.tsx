'use client';

import { useVendorFormContext } from '@/contexts/super-admin/enatega-deliveries/vendors/vendor-form-context';
import { Step1Form } from './Step1';
import { Step2Form } from './Step2';

export const AddVendorForm = () => {
  const { currentStep } = useVendorFormContext();

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
