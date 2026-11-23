import type {
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  Step6Data,
} from '@/types/entities/vendor/store';

export interface ShopTypeOption {
  key: string;
  value: string;
  icon: React.ReactNode;
}

export interface shopTiming {
  id: string;
  day: string;
}

export interface Step2FormProps {
  initialData: Step2Data | null;
  onSubmit: (data: Step2Data) => void;
  onBack: () => void;
  translationNamespace: string;
}

export interface Step3FormProps {
  initialData: Step3Data | null;
  onSubmit: (data: Step3Data) => void;
  onBack: () => void;
  translationNamespace: string;
}

export interface Step4FormProps {
  initialData: Step4Data | null;
  onSubmit: (data: Step4Data) => void;
  onBack: () => void;
  translationNamespace: string;
}

export interface Step5FormProps {
  initialData: Step5Data | null;
  onSubmit: (data: Step5Data) => void;
  onBack: () => void;
}

export interface Step6FormProps {
  initialData: Step6Data | null;
  onSubmit: (data: Step6Data) => void;
  onBack: () => void;
}
