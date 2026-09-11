'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface RiderStep1Data {
  name: string;
  email: string;
  phone: string;
  zone_id: string; // city / zone
  password: string;
  confirm_password: string;
  send_login_credentials_email: boolean;
}

export interface RiderStep2Data {
  profile_picture: File | null;
  driver_license_front: File | null;
  driver_license_back: File | null;
  national_id_front: File | null;
  national_id_back: File | null;
  vehicle_registration_front: File | null;
  vehicle_registration_back: File | null;
  company_commercial_registration: File | null;
}

export interface RiderStep3Data {
  vehicle_brand: string;
  model_year_limit: number | string | null;
  vehicle_color: string;
  vehicle_number: string;
  vehicle_type: string;

  vehicle_in_good_condition: boolean;
  insulated_delivery_bag: boolean;
  air_conditioning?: boolean;
  helmet?: boolean;
}

export interface RiderStep4Data {
  cod_limit_enabled: boolean;
  cod_limit_amount: number | string | null;
  cod_warning_threshold: string;
  cod_auto_settlement_cycle: string;
  cod_allow_online_payments_when_blocked: boolean;
}

export interface RiderFormData {
  step1: RiderStep1Data | null;
  step2: RiderStep2Data | null;
  step3: RiderStep3Data | null;
  step4: RiderStep4Data | null;
}

interface RiderFormContextType {
  currentStep: number;
  totalSteps: number;
  formData: RiderFormData;
  setStep1Data: (data: RiderStep1Data) => void;
  setStep2Data: (data: RiderStep2Data) => void;
  setStep3Data: (data: RiderStep3Data) => void;
  setStep4Data: (data: RiderStep4Data) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetForm: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const RiderFormContext = createContext<RiderFormContextType | undefined>(
  undefined,
);

export const useRiderFormContext = () => {
  const context = useContext(RiderFormContext);
  if (!context) {
    throw new Error(
      'useRiderFormContext must be used within RiderFormProvider',
    );
  }
  return context;
};

interface RiderFormProviderProps {
  children: ReactNode;
  totalSteps?: number;
}

export const RiderFormProvider: React.FC<RiderFormProviderProps> = ({
  children,
  totalSteps = 4,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RiderFormData>({
    step1: null,
    step2: null,
    step3: null,
    step4: null,
  });

  const setStep1Data = (data: RiderStep1Data) => {
    setFormData((prev) => ({ ...prev, step1: data }));
  };

  const setStep2Data = (data: RiderStep2Data) => {
    setFormData((prev) => ({ ...prev, step2: data }));
  };

  const setStep3Data = (data: RiderStep3Data) => {
    setFormData((prev) => ({ ...prev, step3: data }));
  };

  const setStep4Data = (data: RiderStep4Data) => {
    setFormData((prev) => ({ ...prev, step4: data }));
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
      step3: null,
      step4: null,
    });
  };

  const canGoNext = currentStep < totalSteps;
  const canGoPrev = currentStep > 1;

  const value: RiderFormContextType = {
    currentStep,
    totalSteps,
    formData,
    setStep1Data,
    setStep2Data,
    setStep3Data,
    setStep4Data,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    canGoNext,
    canGoPrev,
  };

  return (
    <RiderFormContext.Provider value={value}>
      {children}
    </RiderFormContext.Provider>
  );
};
