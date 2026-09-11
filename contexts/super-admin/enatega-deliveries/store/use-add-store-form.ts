import type {
    StoreFormData,
} from "@/types/entities/super-admin/enatega-deliveries/store-form";
import { create } from "zustand";

type StepKey = keyof StoreFormData;

interface addStoreFormStore {

    currentStep: number;
    formData: StoreFormData;

    nextStep: () => void;
    prevStep: () => void;
    setStepData: <K extends StepKey>(
        step: K,
        data: StoreFormData[K]
    ) => void;

    resetForm: () => void;
}

const initialFormData: StoreFormData = {

    step1: null,
    step2: null,
    step3: null,
    step4: null,
    step5: null,
    step6: null,
}

export const useAddStoreForm = create<addStoreFormStore>((set) => ({
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
