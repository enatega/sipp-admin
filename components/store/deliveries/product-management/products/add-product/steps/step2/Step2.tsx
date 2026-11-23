'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProductFormContext } from '@/contexts/store/deliveries/product-management/product-form-context';
import {
  uniqueVariationSkus,
  variationGroupValidationSchema,
} from '@/schemas/store/deliveries/product-management/product-customization.schema';
import type { ApiErrorResponse, ProductVariationFormValue } from '@/types';
import { FieldArray, Form, Formik } from 'formik';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { cleanAllergens } from '@/lib/allergens';
import { cleanNutritionFacts } from '@/lib/nutrition-facts';
import {
  deriveVariationSku,
  rebaseVariationSkus,
  removeVariationKeepingSkus,
} from '@/lib/product-sku';
import {
  UNLIMITED_STOCK_VALUE,
  toVariationStockQuantity,
} from '@/lib/product-variation-settings';
import { getStorePath } from '@/lib/store';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetAddonsDropdown } from '@/hooks/api/store/deliveries/product-management/addons';
import { useCreateProduct } from '@/hooks/api/store/deliveries/product-management/products';
import { AppButton } from '@/components/shared/AppButton';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { VariationBasePriceHint } from '@/components/shared/VariationBasePriceHint';
import { useProductPricingHints } from '../../useProductPricingHints';
import { VariationFormCard } from './VariationFormCard';

// Same first page the add-on pickers load, so it is fetched once and shared.
const ADDON_LIBRARY_PAGE_SIZE = 100;
const INITIAL_VARIATION_COUNT = 2;

/** A blank card; its SKU follows the product SKU and the card's position (1-based). */
const createEmptyVariation = (
  productSku: string,
  position: number,
): ProductVariationFormValue => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  sku: deriveVariationSku(productSku, position),
  nameTranslations: {},
  price: '',
  stockQuantity: UNLIMITED_STOCK_VALUE,
  addOnIds: [],
  image: undefined,
  nutritionFacts: [],
  allergens: [],
});

type Step2Values = {
  variations: ProductVariationFormValue[];
};

interface Props {
  /** Product SKU the server reserved for this form; `null` while there is none. */
  suggestedSku: string | null;
}

/** Step 2 of "Product with variations": one card per variation. */
export const Step2Form: React.FC<Props> = ({ suggestedSku }) => {
  const router = useRouter();
  const { storeId } = useParams() as { storeId?: string };
  const { formData, prevStep, resetForm, setStep2Data } =
    useProductFormContext();
  const t = useTranslations('products.addProduct.step2');
  const tSchema = useTranslations('products.Schemas.product');
  const [apiError, setApiError] = React.useState<string | null>(null);
  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const { taxRate, dealSummary } = useProductPricingHints(
    storeId,
    formData.step1?.taxRateId,
    formData.step1?.dealId,
  );
  // Lets a variation show add-ons copied from the first one before its own
  // picker has been opened.
  const { data: addonLibrary } = useGetAddonsDropdown(
    storeId
      ? { store_id: storeId, offset: 0, size: ADDON_LIBRARY_PAGE_SIZE }
      : null,
    { enabled: !!storeId },
  );

  const productSku = formData.step1?.sku?.trim() ?? '';
  const savedStep2 = formData.step2;
  const initialValues = React.useMemo<Step2Values>(
    () => ({
      variations: savedStep2?.variants.length
        ? // The product SKU may have been changed in step 1 since.
          rebaseVariationSkus(
            savedStep2.variants,
            savedStep2.productSku,
            productSku,
          )
        : Array.from({ length: INITIAL_VARIATION_COUNT }, (_, index) =>
            createEmptyVariation(productSku, index + 1),
          ),
    }),
    [savedStep2, productSku],
  );

  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        variations: Yup.array()
          .of(
            variationGroupValidationSchema(t, {
              requireImage: true,
              withStock: true,
            }),
          )
          .min(1, t('errors.atLeastOneVariant'))
          .test('unique-skus', uniqueVariationSkus(t)),
      }),
    [t],
  );

  const handleSubmit = async (values: Step2Values) => {
    const step1 = formData.step1;

    if (!step1 || !storeId) {
      setApiError(t('completeStep1Error'));
      return;
    }

    if (!(step1.image instanceof File)) {
      setApiError(tSchema('imageRequired'));
      return;
    }

    const variations = values.variations.map((variation) => ({
      ...variation,
      name: variation.name.trim(),
      price: String(variation.price || '').trim(),
      nutritionFacts: cleanNutritionFacts(variation.nutritionFacts),
      allergens: cleanAllergens(variation.allergens),
    }));

    setApiError(null);
    setStep2Data({ variants: variations, productSku });

    try {
      const response = await createProduct({
        store_id: storeId,
        category_id: step1.categoryId,
        subcategory_id: step1.subcategoryId || undefined,
        name: step1.name.trim(),
        // Left blank, the server generates the SKU.
        sku: productSku || undefined,
        nameTranslations: step1.nameTranslations,
        taxRateId: step1.taxRateId || undefined,
        description: step1.description || undefined,
        descriptionTranslations: step1.descriptionTranslations,
        unit_of_measure: step1.unitOfMeasure || undefined,
        image: step1.image,
        favouriteFoodIds: step1.favouriteFoodIds ?? [],
        deal_ids: step1.dealId ? [step1.dealId] : [],
        // Stock and add-ons are set per variation.
        variations: variations.map((variation) => ({
          name: variation.name,
          sku: variation.sku?.trim() || undefined,
          nameTranslations: variation.nameTranslations,
          price: Number(variation.price),
          image: variation.image instanceof File ? variation.image : undefined,
          stockQuantity: toVariationStockQuantity(variation.stockQuantity),
          addOnIds: variation.addOnIds ?? [],
          nutritionFacts: variation.nutritionFacts,
          allergens: variation.allergens,
        })),
      });

      toast.success(response.message || t('productCreatedSuccess'));
      resetForm();
      router.push(getStorePath(storeId, '/product-management/products'));
    } catch (error) {
      setApiError(returnErrorMessage(error as ApiErrorResponse));
    }
  };

  return (
    <div className="md:min-w-[700px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => {
          const isBusy = isPending || isSubmitting;
          const firstAddOnIds = values.variations[0]?.addOnIds ?? [];

          return (
            <Form className="space-y-5">
              <VariationBasePriceHint />

              <FieldArray name="variations">
                {({ push, remove }) => (
                  <>
                    {values.variations.map((variation, index) => (
                      <VariationFormCard
                        key={variation.id}
                        index={index}
                        storeId={storeId}
                        productSku={productSku}
                        suggestedProductSku={suggestedSku}
                        disabled={isBusy}
                        taxRate={taxRate}
                        dealSummary={dealSummary}
                        knownAddons={addonLibrary?.data}
                        onRemove={
                          values.variations.length > 1
                            ? () => {
                                remove(index);
                                // The cards after it move up; so do the SKUs
                                // that were never typed over.
                                void setFieldValue(
                                  'variations',
                                  removeVariationKeepingSkus(
                                    values.variations,
                                    index,
                                    productSku,
                                  ),
                                );
                              }
                            : undefined
                        }
                        onCopyAddons={
                          index > 0 && firstAddOnIds.length > 0
                            ? () =>
                                void setFieldValue(
                                  `variations.${index}.addOnIds`,
                                  [...firstAddOnIds],
                                )
                            : undefined
                        }
                      />
                    ))}

                    <AppButton
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        push(
                          createEmptyVariation(
                            productSku,
                            values.variations.length + 1,
                          ),
                        )
                      }
                      disabled={isBusy}
                      leftIcon={<Plus className="size-4" />}
                    >
                      {t('addVariantButton')}
                    </AppButton>
                  </>
                )}
              </FieldArray>

              <FormErrorDisplay
                apiError={apiError}
                formikErrors={errors}
                touched={touched}
              />

              <div className="flex items-center justify-end border-t pt-4 gap-4 mt-6">
                <AppButton
                  type="button"
                  variant="secondary"
                  className="px-12 rounded-[12px]"
                  onClick={prevStep}
                  disabled={isBusy}
                >
                  {t('previousButton')}
                </AppButton>
                <AppButton
                  type="submit"
                  className="px-12 rounded-[12px]"
                  isLoading={isBusy}
                  disabled={isBusy}
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
};
