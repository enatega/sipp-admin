'use client';

import { useRiderFormContext } from '@/contexts/super-admin/enatega-deliveries/rider/rider-form-context';
import { Step1Form } from './Step1';
import { Step2Form } from './Step2';
import { Step3Form } from './Step3';
import { Step4Form } from './Step4';

export const AddRiderForm = () => {
  const { currentStep } = useRiderFormContext();

  return (
    <div className="flex-1">
      {currentStep === 1 ? (
        <Step1Form />
      ) : currentStep === 2 ? (
        <Step2Form />
      ) : currentStep === 3 ? (
        <Step3Form />
      ) : currentStep === 4 ? (
        <Step4Form />
      ) : (
        ''
      )}
    </div>
  );
};
