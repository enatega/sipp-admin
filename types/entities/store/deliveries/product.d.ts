export interface ProductCustomizationOption extends Record<string, unknown> {
  id: string;
  store_id: string | null;
  title: string;
  price: string | number;
  description: string | null;
  unitOfMeasure: string | null;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCustomizationGroup extends Record<string, unknown> {
  id: string;
  store_id: string | null;
  name: string;
  description: string | null;
  price: string | number;
  minSelect: number;
  maxSelect: number;
  status: boolean;
  requiredCheck: boolean;
  selectionType: 'single' | 'multi';
  imageUrl: string | null;
  type: 'variation' | 'add-on';
  dependsOnVariationId: string | null;
  createdAt: string;
  updatedAt: string;
  options: ProductCustomizationOption[];
}

export interface Product extends Record<string, unknown> {
  id: string;
  name: string;
  unitOfMeasure: string | null;
  stockQuantity: number;
  inStock: boolean;
  shortDescription: string | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  menu_ids?: string[] | null;
  menuIds?: string[] | null;
  deal_ids?: string[] | null;
  dealIds?: string[] | null;
  store_id: string;
  price: string | number;
  customization_group: string[] | null;
  description: string | null;
  imageUrl: string | null;
  images?: string[] | null;
  productImages?: string[] | null;
  category?: {
    id: string;
    categoryName?: string;
    name?: string;
  } | null;
  subcategory?: {
    id: string;
    categoryName?: string;
    name?: string;
  } | null;
  deals?: Array<{
    id: string;
    deal_name?: string;
    dealName?: string;
    applies_on?: 'product' | 'variation' | 'both' | string;
    appliesOn?: 'product' | 'variation' | 'both' | string;
    product_id?: string | null;
    productId?: string | null;
    variation_id?: string | null;
    variationId?: string | null;
    discountType?: 'percentage' | 'fixed' | string;
    discountValue?: number | string | null;
    discount_type?: 'percentage' | 'fixed' | string;
    discount_value?: number | string | null;
  }> | null;
  customizationGroups: ProductCustomizationGroup[];
}

export interface CreateProductFormValues {
  name: string;
  menuIds?: string[];
  categoryId: string;
  subcategoryId: string;
  price: string;
  stockQuantity: string;
  unitOfMeasure: string;
  description: string;
  image?: File | string | null;
  images?: Array<File | string> | null;
  addOnIds: string[];
  dealId: string;
}

export interface ProductVariationFormValue {
  id: string;
  name: string;
  price: string;
  image?: File | string | null;
  isEditing?: boolean;
}

export interface EditProductFormValues {
  name: string;
  menuIds?: string[];
  categoryId: string;
  subcategoryId: string;
  price: string;
  stockQuantity: string;
  unitOfMeasure: string;
  description: string;
  image?: File | string | null;
  images?: Array<File | string> | null;
  dealId: string;
}

export interface EditProductAddonGroupFormValues {
  name: string;
  description: string;
  requiredCheck: boolean;
  selectionType: 'single' | 'multi' | '';
  optionIds: string[];
}

export interface EditProductVariationGroupFormValues {
  name: string;
  price: string;
  image?: File | string | null;
}
