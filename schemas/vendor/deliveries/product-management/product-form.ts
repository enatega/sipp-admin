import * as Yup from 'yup';
import {
  productBasicsSchema,
  singleProductFormSchema,
} from '@/schemas/store/deliveries/product-form';

type Translate = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

/** A chain product must be listed on at least one menu. */
const menuIdsSchema = (t: (key: string) => string) =>
  Yup.array()
    .of(Yup.string().required())
    .min(1, t('products.Schemas.product.menuIdsRequired'))
    .required(t('products.Schemas.product.menuIdsRequired'));

/** Step 1 of the vendor's "Product with variations": the basics plus the menus. */
export const vendorProductBasicsSchema = (t: (key: string) => string) =>
  productBasicsSchema(t).shape({ menuIds: menuIdsSchema(t) });

/**
 * The vendor's one-page "Single product" form.
 * `tVariation` is scoped to `products.addProduct.step2` (stock, nutrition and allergen errors).
 */
export const vendorSingleProductFormSchema = (
  t: (key: string) => string,
  tVariation: Translate,
) => singleProductFormSchema(t, tVariation).shape({ menuIds: menuIdsSchema(t) });
