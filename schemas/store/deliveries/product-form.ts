import * as Yup from 'yup';
import { allergensSchema } from '@/lib/allergens';
import { nutritionFactsSchema } from '@/lib/nutrition-facts';
import { variationStockSchema } from './product-management/product-customization.schema';

type Translate = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const imageFile = Yup.mixed<File | string>()
  .nullable()
  .test('fileType', 'Invalid file type. Only PNG, JPG, and WebP are allowed', (file) =>
    !file || typeof file === 'string' || IMAGE_TYPES.includes(file.type)
  )
  .test('fileSize', `Image size must be less than ${MAX_MB}MB`, (file) =>
    !file || typeof file === 'string' || file.size <= MAX_BYTES
  );

export const productFormStep1Schema = (t: (key: string) => string) =>
  Yup.object().shape({
    name: Yup.string()
      .required(t('products.Schemas.product.nameRequired'))
      .min(2, t('products.Schemas.product.nameMinLength'))
      .max(100, t('products.Schemas.product.nameMaxLength')),
    sku: Yup.string()
      .trim()
      .max(100, t('products.Schemas.product.skuMaxLength'))
      .optional(),
    categoryId: Yup.string().required(t('products.Schemas.product.categoryRequired')),
    subcategoryId: Yup.string().optional(),
    price: Yup.number()
      .required(t('products.Schemas.product.priceRequired'))
      .positive(t('products.Schemas.product.priceInvalid'))
      .typeError(t('products.Schemas.product.priceRequired')),
    stockQuantity: Yup.number()
      .required(t('products.Schemas.product.stockQuantityRequired'))
      .min(0, t('products.Schemas.product.stockQuantityMin'))
      .typeError(t('products.Schemas.product.stockQuantityRequired')),
    addOnIds: Yup.array().of(Yup.string()).optional(),
    favouriteFoodIds: Yup.array().of(Yup.string().required()).optional(),
    dealId: Yup.string().optional(),
    unitOfMeasure: Yup.string().optional(),
    description: Yup.string().optional(),
    image: imageFile.required(t('products.Schemas.product.imageRequired')),
  });

/** Step 1 of "Product with variations": price, stock and add-ons are not asked here. */
export const productBasicsSchema = (t: (key: string) => string) =>
  productFormStep1Schema(t).omit(['price', 'stockQuantity', 'addOnIds']);

/**
 * The one-page "Single product" form.
 * `tVariation` is scoped to `products.addProduct.step2` (stock, nutrition and allergen errors).
 */
export const singleProductFormSchema = (
  t: (key: string) => string,
  tVariation: Translate,
) =>
  productFormStep1Schema(t).shape({
    stockQuantity: variationStockSchema(tVariation),
    nutritionFacts: nutritionFactsSchema(tVariation),
    allergens: allergensSchema(tVariation),
  });
