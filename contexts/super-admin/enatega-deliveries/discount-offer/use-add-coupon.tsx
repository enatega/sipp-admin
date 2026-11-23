import { create } from 'zustand';
import { AddCouponFormData } from '@/types/entities/super-admin/enatega-deliveries/discount-coupons';

type stepKey = keyof AddCouponFormData;

interface AddCouponFormState {
  currentStep: number;
  formData: AddCouponFormData;
  nextStep: () => void;
  prevStep: () => void;
  setStepData: <K extends stepKey>(
    step: K,
    data: NonNullable<AddCouponFormData[K]>,
  ) => void;
  resetForm: () => void;
}

export const useAddCouponForm = create<AddCouponFormState>((set) => ({
  currentStep: 1,
  formData: {
    step1: null,
    step2: null,
    step3: null,
    step4: null,
    step5: null,
  },
  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  setStepData: (step, data) =>
    set((state) => ({ formData: { ...state.formData, [step]: data } })),
  resetForm: () =>
    set({
      currentStep: 1,
      formData: {
        step1: null,
        step2: null,
        step3: null,
        step4: null,
        step5: null,
      },
    }),
}));
