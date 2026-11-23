export interface ProductCustomizationOption extends Record<string, unknown> {
  id: string;
  store_id: string | null;
  title: string;
  titleTranslations?: Record<string, string>;
  price: string | number;
  description: string | null;
  descriptionTranslations?: Record<string, string>;
  unitOfMeasure: string | null;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCustomizationGroup extends Record<string, unknown> {
  id: string;
  store_id: string | null;
  name: string;
  nameTranslations?: Record<string, string>;
  description: string | null;
  descriptionTranslations?: Record<string, string>;
  price: string | number;
  minSelect: number;
  maxSelect: number;
  status: boolean;
  requiredCheck: boolean;
  selectionType: 'single' | 'multi';
  imageUrl: string | null;
  sku?: string | null;
  nutritionFacts?: import('@/lib/nutrition-facts').NutritionFact[] | null;
  allergens?: Array<{ allergen: string; note: string | null; noteTranslations?: Record<string, string> }> | null;
  type: 'variation' | 'add-on';
  dependsOnVariationId: string | null;
  legacyMigrationMetadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  options: ProductCustomizationOption[];
}

/**
 * Stock, SKU and add-on groups of one variation. `variationId` is the variation
 * group id, or the option id for a migrated option-backed variation.
 */
export interface ProductVariationSettings {
  variationId: string;
  groupId: string;
  sku: string | null;
  /** `null` means unlimited. */
  stockQuantity: number | null;
  inStock: boolean;
  addOnGroupIds: string[];
}

export interface Product extends Record<string, unknown> {
  taxRateId?: string | null;
  taxRate?: import('@/types/tax').TaxRate | null;
  id: string;
  sku?: string | null;
  name: string;
  nameTranslations?: Record<string, string>;
  favouriteFoods?: Array<{ id: string; name: string; nameTranslations?: Record<string, string>; isActive?: boolean; isDeleted?: boolean }>;
  unitOfMeasure: string | null;
  stockQuantity: number;
  inStock: boolean;
  isPublished: boolean;
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
  descriptionTranslations?: Record<string, string>;
  imageUrl: string | null;
  images?: string[] | null;
  productImages?: string[] | null;
  category?: {
    id: string;
    categoryName?: string;
    name?: string;
    nameTranslations?: Record<string, string>;
  } | null;
  subcategory?: {
    id: string;
    categoryName?: string;
    name?: string;
    nameTranslations?: Record<string, string>;
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
  /** Empty for a product without variations. */
  variationSettings?: ProductVariationSettings[];
}

export interface CreateProductFormValues {
  favouriteFoodIds?: string[];
  taxRateId?: string;
  name: string;
  sku?: string;
  nameTranslations?: Record<string, string>;
  menuIds?: string[];
  categoryId: string;
  subcategoryId: string;
  stockQuantity: string;
  unitOfMeasure: string;
  description: string;
  descriptionTranslations?: Record<string, string>;
  image?: File | string | null;
  images?: Array<File | string> | null;
  addOnIds: string[];
  dealId: string;
}

/**
 * Step 1 of "Product with variations": the details every variation shares,
 * with the product SKU (prefilled, editable; blank = generated on save).
 */
export type ProductBasicsFormValues = Omit<
  CreateProductFormValues,
  'stockQuantity' | 'addOnIds'
>;

/** The one-page "Single product" form. */
export interface SingleProductFormValues extends ProductBasicsFormValues {
  price: string;
  /** '2147483647' while the Unlimited switch is on. */
  stockQuantity: string;
  addOnIds: string[];
  nutritionFacts?: import('@/lib/nutrition-facts').NutritionFact[];
  allergens?: import('@/lib/allergens').VariationAllergen[];
}

export interface ProductVariationFormValue {
  id: string;
  name: string;
  nameTranslations?: Record<string, string>;
  sku?: string;
  price: string;
  /** '2147483647' while the Unlimited switch is on. */
  stockQuantity?: string;
  addOnIds?: string[];
  image?: File | string | null;
  nutritionFacts?: import('@/lib/nutrition-facts').NutritionFact[];
  allergens?: import('@/lib/allergens').VariationAllergen[];
  isEditing?: boolean;
}

export interface EditProductFormValues {
  favouriteFoodIds?: string[];
  taxRateId?: string;
  name: string;
  sku?: string;
  nameTranslations?: Record<string, string>;
  menuIds?: string[];
  categoryId: string;
  subcategoryId: string;
  price: string;
  stockQuantity: string;
  unitOfMeasure: string;
  description: string;
  descriptionTranslations?: Record<string, string>;
  image?: File | string | null;
  images?: Array<File | string> | null;
  dealId: string;
}

export interface EditProductAddonGroupFormValues {
  name: string;
  nameTranslations?: Record<string, string>;
  description: string;
  descriptionTranslations?: Record<string, string>;
  requiredCheck: boolean;
  selectionType: 'single' | 'multi' | '';
  optionIds: string[];
  minSelect?: string;
  maxSelect?: string;
}

/** Stock, availability and add-ons of one variation, as edited in a form. */
export interface ProductVariationSettingsFormValues {
  sku?: string;
  /** '2147483647' while the Unlimited switch is on. */
  stockQuantity?: string;
  inStock?: boolean;
  addOnIds?: string[];
}

export interface EditProductVariationGroupFormValues
  extends ProductVariationSettingsFormValues {
  name: string;
  nameTranslations?: Record<string, string>;
  price: string;
  image?: File | string | null;
  nutritionFacts?: import('@/lib/nutrition-facts').NutritionFact[];
  allergens?: import('@/lib/allergens').VariationAllergen[];
}
