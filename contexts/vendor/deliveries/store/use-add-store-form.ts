import type {
  VendorStoreFormData,
} from "@/types/entities/vendor/store";
import { create } from "zustand";

type StepKey = keyof VendorStoreFormData;

interface addStoreFormStore {

  currentStep: number;
  formData: VendorStoreFormData;

  nextStep: () => void;
  prevStep: () => void;
  setStepData: <K extends StepKey>(
    step: K,
    data: VendorStoreFormData[K]
  ) => void;

  resetForm: () => void;
}

const initialFormData: VendorStoreFormData = {

  step1: null,
  step2: null,
  step3: null,
  step4: null,
  step5: null,
  step6: null,
}

export const useVendorAddStoreForm = create<addStoreFormStore>((set) => ({
  currentStep: 1,
  formData: initialFormData,

  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, 5)
  })),

  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 1)
  })),

  setStepData: (step, data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [step]: data
      }
    })),

  resetForm: () => set({
    currentStep: 1,
    formData: initialFormData
  })
}))
