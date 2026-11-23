'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { ApiErrorResponse, SingleProductFormValues } from '@/types';
import { singleProductFormSchema } from '@/schemas/store/deliveries/product-form';
import { Form, Formik, useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { cleanAllergens } from '@/lib/allergens';
import { cleanNutritionFacts } from '@/lib/nutrition-facts';
import { deriveVariationSku } from '@/lib/product-sku';
import {
  UNLIMITED_STOCK_VALUE,
  toVariationStockQuantity,
} from '@/lib/product-variation-settings';
import { getStorePath } from '@/lib/store';
import { returnErrorMessage } from '@/lib/toast-error';
import { useCreateProduct } from '@/hooks/api/store/deliveries/product-management/products';
import { AppButton } from '@/components/shared/AppButton';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { NutritionAllergensField } from '@/components/shared/form/NutritionAllergensField';
import { AllergenNoteTranslations } from '@/components/store/deliveries/product-management/common/AllergenNoteTranslations';
import { NutritionFactTranslations } from '@/components/store/deliveries/product-management/common/NutritionFactTranslations';
import { VariationAddonsField } from '../variation-settings/VariationAddonsField';
import { VariationStockField } from '../variation-settings/VariationStockField';
import { ProductBasicsFields } from './ProductBasicsFields';
import { ProductPriceField } from './ProductPriceField';
import { useProductPricingHints } from './useProductPricingHints';
import { useProductSkuSuggestion } from './useProductSkuSuggestion';

const EMPTY_VALUES: SingleProductFormValues = {
  name: '',
  sku: '',
  nameTranslations: {},
  categoryId: '',
  subcategoryId: '',
  favouriteFoodIds: [],
  taxRateId: '',
  price: '',
  stockQuantity: UNLIMITED_STOCK_VALUE,
  unitOfMeasure: '',
  addOnIds: [],
  dealId: '',
  description: '',
  descriptionTranslations: {},
  image: undefined,
  nutritionFacts: [],
  allergens: [],
};

/** One-page form for a product that is sold as is, with one price. */
export function SingleProductForm() {
  const router = useRouter();
  const { storeId } = useParams() as { storeId?: string };
  const t = useTranslations('products.addProduct.single');
  const tSchema = useTranslations();
  const tStep2 = useTranslations('products.addProduct.step2');
  const tErrors = useTranslations('products.errors');
  const [apiError, setApiError] = React.useState<string | null>(null);
  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const suggestedSku = useProductSkuSuggestion({ storeId, enabled: !!storeId });

  const handleSubmit = async (values: SingleProductFormValues) => {
    if (!storeId) {
      setApiError(tErrors('storeIdRequired'));
      return;
    }
    // The schema already requires an uploaded image.
    if (!(values.image instanceof File)) return;

    const name = values.name.trim();
    // Left blank, the server generates the product and variation SKUs.
    const sku = values.sku?.trim() || undefined;
    setApiError(null);

    try {
      const response = await createProduct({
        store_id: storeId,
        category_id: values.categoryId,
        subcategory_id: values.subcategoryId || undefined,
        name,
        sku,
        nameTranslations: values.nameTranslations,
        taxRateId: values.taxRateId || undefined,
        description: values.description || undefined,
        descriptionTranslations: values.descriptionTranslations,
        unit_of_measure: values.unitOfMeasure || undefined,
        image: values.image,
        favouriteFoodIds: values.favouriteFoodIds ?? [],
        deal_ids: values.dealId ? [values.dealId] : [],
        // Sold as is: the API still stores the price, stock and add-ons on one
        // variation, which takes the product's own name and image. Its SKU is
        // not asked: it follows the product SKU as `<sku>-1`.
        variations: [
          {
            name,
            sku: deriveVariationSku(sku, 1) || undefined,
            nameTranslations: values.nameTranslations,
            price: Number(values.price),
            image: values.image,
            stockQuantity: toVariationStockQuantity(values.stockQuantity),
            addOnIds: values.addOnIds,
            nutritionFacts: cleanNutritionFacts(values.nutritionFacts),
            allergens: cleanAllergens(values.allergens),
          },
        ],
      });

      toast.success(response.message || t('createdSuccess'));
      router.push(getStorePath(storeId, '/product-management/products'));
    } catch (error) {
      setApiError(returnErrorMessage(error as ApiErrorResponse));
    }
  };

  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <Formik
        initialValues={EMPTY_VALUES}
        validationSchema={singleProductFormSchema(tSchema, tStep2)}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => {
          const isBusy = isPending || isSubmitting;

          return (
            <Form className="space-y-5">
              <SingleProductFields
                storeId={storeId}
                suggestedSku={suggestedSku}
                disabled={isBusy}
              />

              <FormErrorDisplay
                apiError={apiError}
                formikErrors={errors}
                touched={touched}
              />

              <div className="flex items-end justify-end">
                <AppButton
                  type="submit"
                  isLoading={isBusy}
                  disabled={isBusy}
                  className="px-12 h-10 rounded-[12px] mt-6"
                >
                  {t('submitButton')}
                </AppButton>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

function SingleProductFields({
  storeId,
  suggestedSku,
  disabled,
}: {
  storeId?: string;
  suggestedSku: string | null;
  disabled: boolean;
}) {
  const t = useTranslations('products.addProduct.single');
  const { values } = useFormikContext<SingleProductFormValues>();
  const { taxRate, dealSummary } = useProductPricingHints(
    storeId,
    values.taxRateId,
    values.dealId,
  );

  return (
    <>
      <ProductBasicsFields
        storeId={storeId}
        suggestedSku={suggestedSku}
        autoFillSku
        afterUnit={
          <VariationAddonsField
            name="addOnIds"
            storeId={storeId}
            disabled={disabled}
            helperText={t('addonsHelper')}
          />
        }
      >
        <ProductPriceField
          name="price"
          taxRate={taxRate}
          dealSummary={dealSummary}
        />
        <VariationStockField name="stockQuantity" disabled={disabled} />
      </ProductBasicsFields>

      <NutritionAllergensField
        nutritionName="nutritionFacts"
        allergensName="allergens"
        disabled={disabled}
        subtitle={t('nutritionSubtitle')}
        allergensEmptyText={t('allergensEmpty')}
        renderAllergenExtras={(rowPath) => (
          <AllergenNoteTranslations rowPath={rowPath} disabled={disabled} />
        )}
        renderNutritionFactExtras={(factPath) => (
          <NutritionFactTranslations factPath={factPath} disabled={disabled} />
        )}
      />
    </>
  );
}
