'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface VendorStep1Data {
  name: string;
  email: string;
  phone: string;
  password: string;
  zone_id: string;
  autoGeneratePassword?: boolean;
  mailLoginCredentials?: boolean;
  changePasswordAllowed?: boolean;
}

export interface VendorStep2Data {
  logo?: File | null;
  business_license_front?: File | null;
  business_license_back?: File | null;
  national_id_passport_front?: File | null;
  national_id_passport_back?: File | null;
}

export interface VendorFormData {
  step1: VendorStep1Data | null;
  step2: VendorStep2Data | null;
}

interface VendorFormContextType {
  currentStep: number;
  totalSteps: number;
  formData: VendorFormData;
  setStep1Data: (data: VendorStep1Data) => void;
  setStep2Data: (data: VendorStep2Data) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetForm: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const VendorFormContext = createContext<VendorFormContextType | undefined>(
  undefined,
);

export const useVendorFormContext = () => {
  const context = useContext(VendorFormContext);
  if (!context) {
    throw new Error(
      'useVendorFormContext must be used within VendorFormProvider',
    );
  }
  return context;
};

interface VendorFormProviderProps {
  children: ReactNode;
  totalSteps?: number;
}

export const VendorFormProvider: React.FC<VendorFormProviderProps> = ({
  children,
  totalSteps = 2,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<VendorFormData>({
    step1: null,
    step2: null,
  });

  const setStep1Data = (data: VendorStep1Data) => {
    setFormData((prev) => ({ ...prev, step1: data }));
  };

  const setStep2Data = (data: VendorStep2Data) => {
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

  const value: VendorFormContextType = {
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
    <VendorFormContext.Provider value={value}>
      {children}
    </VendorFormContext.Provider>
  );
};
