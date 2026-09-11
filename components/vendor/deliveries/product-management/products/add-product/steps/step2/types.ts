export interface VariantForm {
  name: string;
  price: number;
  discountPrice?: number;
  addons: string;
}

export interface VariantWithId extends VariantForm {
  id: string;
  isEditing: boolean;
}
