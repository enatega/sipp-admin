import type {
  ProductBasicsFormValues,
  SingleProductFormValues,
} from '../../store/deliveries/product';

/**
 * Details asked by both vendor add-product forms. A chain product has no tax,
 * deal, favourite food or translation fields, and must be on at least one menu.
 */
export interface VendorProductBasicsFormValues
  extends Pick<
    ProductBasicsFormValues,
    | 'name'
    | 'sku'
    | 'categoryId'
    | 'subcategoryId'
    | 'unitOfMeasure'
    | 'description'
    | 'image'
  > {
  menuIds: string[];
}

/** The vendor's one-page "Single product" form. */
export interface VendorSingleProductFormValues
  extends VendorProductBasicsFormValues,
    Pick<
      SingleProductFormValues,
      'price' | 'stockQuantity' | 'addOnIds' | 'nutritionFacts' | 'allergens'
    > {}
