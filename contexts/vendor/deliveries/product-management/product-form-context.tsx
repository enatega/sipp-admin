'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';
import type {
  CreateProductFormValues,
  ProductVariationFormValue,
} from '@/types';

export type Step1Data = CreateProductFormValues;

export interface Step2Data {
  variants: ProductVariationFormValue[];
}

// Complete Product Form Data
export interface ProductFormData {
  step1: Step1Data | null;
  step2: Step2Data | null;
}

interface ProductFormContextType {
  currentStep: number;
  totalSteps: number;
  formData: ProductFormData;
  setStep1Data: (data: Step1Data) => void;
  setStep2Data: (data: Step2Data) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetForm: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const ProductFormContext = createContext<ProductFormContextType | undefined>(
  undefined,
);

export const useProductFormContext = () => {
  const context = useContext(ProductFormContext);
  if (!context) {
    throw new Error(
      'useProductFormContext must be used within ProductFormProvider',
    );
  }
  return context;
};

interface ProductFormProviderProps {
  children: ReactNode;
  totalSteps?: number;
}

export const ProductFormProvider: React.FC<ProductFormProviderProps> = ({
  children,
  totalSteps = 2,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    step1: null,
    step2: null,
  });

  const setStep1Data = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, step1: data }));
  };

  const setStep2Data = (data: Step2Data) => {
    setFormData((prev) => ({ ...prev, step2: data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      step1: null,
      step2: null,
    });
  };

  const canGoNext = currentStep < totalSteps;
  const canGoPrev = currentStep > 1;

  const value: ProductFormContextType = {
    currentStep,
    totalSteps,
    formData,
    setStep1Data,
    setStep2Data,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    canGoNext,
    canGoPrev,
  };

  return (
    <ProductFormContext.Provider value={value}>
      {children}
    </ProductFormContext.Provider>
  );
};
