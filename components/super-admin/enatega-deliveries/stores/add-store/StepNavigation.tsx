'use client';

import { useLayoutEffect } from 'react';
import { useFormikContext, type FormikValues } from 'formik';
import { useAddStoreForm } from '@/contexts/super-admin/enatega-deliveries/store/use-add-store-form';
import type { StoreFormData } from '@/types/entities/super-admin/enatega-deliveries/store-form';

export type StepNavigationHandler = (targetStep: number) => void;
export type RegisterStepNavigation = (handler: StepNavigationHandler | null) => void;

interface StepNavigationProps {
  step: keyof StoreFormData;
  register: RegisterStepNavigation;
}

export function StepNavigation({
  step,
  register,
}: StepNavigationProps) {
  const { values } = useFormikContext<FormikValues>();
  const setStepData = useAddStoreForm((state) => state.setStepData);
  const goToStep = useAddStoreForm((state) => state.goToStep);
  const currentStep = useAddStoreForm((state) => state.currentStep);
  const completedSteps = useAddStoreForm((state) => state.completedSteps);

  useLayoutEffect(() => {
    register((targetStep) => {
      if (targetStep >= currentStep || !completedSteps.includes(targetStep)) return;
      setStepData(step, values as unknown as StoreFormData[typeof step]);
      goToStep(targetStep);
    });

    return () => register(null);
  }, [completedSteps, currentStep, goToStep, register, setStepData, step, values]);

  return null;
}
