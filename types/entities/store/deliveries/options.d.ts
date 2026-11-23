export interface Option extends Record<string, unknown> {
  id: string;
  title: string;
  titleTranslations?: Record<string, string>;
  price: string | number;
  description: string;
  descriptionTranslations?: Record<string, string>;
  unitOfMeasure: string | null;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface OptionFormData {
  title: string;
  titleTranslations?: Record<string, string>;
  description: string;
  descriptionTranslations?: Record<string, string>;
  stockQuantity: string;
  price: string;
  isActive?: boolean;
}
