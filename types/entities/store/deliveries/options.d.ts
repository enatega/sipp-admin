export interface Option extends Record<string, unknown> {
  id: string;
  title: string;
  price: string | number;
  description: string;
  unitOfMeasure: string | null;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface OptionFormData {
  title: string;
  description: string;
  stockQuantity: string;
  price: string;
  isActive?: boolean;
}
