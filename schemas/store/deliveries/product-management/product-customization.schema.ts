import { nutritionFactsSchema } from '@/lib/nutrition-facts';
import { allergensSchema } from '@/lib/allergens';
import * as Yup from 'yup';
import { addonFormValidationSchema } from './addons.schema';

type TranslationFn = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

// Same rules as the addons page so both add-on forms validate identically.
export const addonGroupValidationSchema = addonFormValidationSchema;

export const variationSkuSchema = (t: TranslationFn, required?: boolean) => {
  const sku = Yup.string().trim().max(100, t('errors.skuMaxLength'));
  return required ? sku.required(t('errors.skuRequired')) : sku.optional();
};

/**
 * Array test for the variations of one form: no two may use the same SKU.
 * Every variation that shares one is flagged on its own SKU field.
 */
export const uniqueVariationSkus = (t: TranslationFn) =>
  function (
    this: Yup.TestContext,
    variations: Array<{ sku?: string } | undefined> | undefined,
  ) {
    const skus = (variations ?? []).map((variation) =>
      (variation?.sku ?? '').trim(),
    );
    const errors = skus.flatMap((sku, index) =>
      sku && skus.indexOf(sku) !== skus.lastIndexOf(sku)
        ? [
            this.createError({
              path: `${this.path}[${index}].sku`,
              message: t('errors.skuDuplicate'),
            }),
          ]
        : [],
    );
    return errors.length ? new Yup.ValidationError(errors) : true;
  };

/** Stock of one variation. The Unlimited switch stores a large whole number. */
export const variationStockSchema = (t: TranslationFn) =>
  Yup.number()
    .typeError(t('errors.stockRequired'))
    .required(t('errors.stockRequired'))
    .integer(t('errors.stockWholeNumber'))
    .min(0, t('errors.stockWholeNumber'));

export const variationGroupValidationSchema = (
  t: TranslationFn,
  options?: {
    requireImage?: boolean;
    requirePrice?: boolean;
    /** An existing variation keeps a SKU once it has one. */
    requireSku?: boolean;
    /** Validate the per-variation stock field. */
    withStock?: boolean;
  },
) =>
  Yup.object().shape({
    name: Yup.string().trim().required(t('errors.nameRequired')),
    sku: variationSkuSchema(t, options?.requireSku),
    ...(options?.withStock ? { stockQuantity: variationStockSchema(t) } : {}),
    nutritionFacts: nutritionFactsSchema(t),
    allergens: allergensSchema(t),
    price: options?.requirePrice === false
      ? Yup.string().optional()
      : Yup.number()
          .typeError(t('errors.priceRequired'))
          .moreThan(0, t('errors.priceRequired'))
          .required(t('errors.priceRequired')),
    image: Yup.mixed<File | string>()
      .nullable()
      .test('required-image', t('errors.imageRequired'), (value) => {
        if (!options?.requireImage) return true;
        return value instanceof File;
      }),
  });
