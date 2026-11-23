'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProductFormContext } from '@/contexts/vendor/deliveries/product-management/product-form-context';
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
import { returnErrorMessage } from '@/lib/toast-error';
import { getVendorPath } from '@/lib/vendor';
import { useCreateProduct } from '@/hooks/api/vendor/deliveries/product-management/products';
import { AppButton } from '@/components/shared/AppButton';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { VariationBasePriceHint } from '@/components/shared/VariationBasePriceHint';
import { VariationFormCard } from '@/components/store/deliveries/product-management/products/add-product/steps/step2/VariationFormCard';
import { VendorVariationAddonsField } from '../../../variation-settings/VendorVariationAddonsField';

const INITIAL_VARIATION_COUNT = 2;

/** A blank card; its SKU follows the product SKU and the card's position (1-based). */
const createEmptyVariation = (
  productSku: string,
  position: number,
): ProductVariationFormValue => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  sku: deriveVariationSku(productSku, position),
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
  /** Store an edited SKU is checked in; without it no check is made. */
  skuStoreId?: string;
}

/** Step 2 of "Product with variations": one card per variation. */
export const Step2Form: React.FC<Props> = ({ suggestedSku, skuStoreId }) => {
  const router = useRouter();
  const { vendorId } = useParams() as { vendorId?: string };
  const { formData, prevStep, resetForm, setStep2Data } =
    useProductFormContext();
  const t = useTranslations('products.addProduct.step2');
  const tSchema = useTranslations('products.Schemas.product');
  const [apiError, setApiError] = React.useState<string | null>(null);
  const { mutateAsync: createProduct, isPending } = useCreateProduct();

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

    if (!step1 || !vendorId) {
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
        store_id: vendorId,
        category_id: step1.categoryId,
        subcategory_id: step1.subcategoryId || undefined,
        name: step1.name.trim(),
        // Left blank, the server generates the SKU.
        sku: productSku || undefined,
        description: step1.description || undefined,
        unit_of_measure: step1.unitOfMeasure || undefined,
        image: step1.image,
        menu_ids: step1.menuIds,
        // Stock and add-ons are set per variation.
        variations: variations.map((variation) => ({
          name: variation.name,
          sku: variation.sku?.trim() || undefined,
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
      router.push(getVendorPath(vendorId, '/product-management/products'));
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
                        // Only the SKU check uses the store here; add-ons
                        // come from the vendor picker below.
                        storeId={skuStoreId}
                        productSku={productSku}
                        suggestedProductSku={suggestedSku}
                        disabled={isBusy}
                        // The vendor panel has no tax or translation fields
                        // and picks from the vendor's own add-on groups.
                        showTranslations={false}
                        showTaxBreakdown={false}
                        addonsField={
                          <VendorVariationAddonsField
                            name={`variations.${index}.addOnIds`}
                            vendorId={vendorId}
                            disabled={isBusy}
                          />
                        }
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
