'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { ApiErrorResponse, VendorSingleProductFormValues } from '@/types';
import { vendorSingleProductFormSchema } from '@/schemas/vendor/deliveries/product-management/product-form';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { cleanAllergens } from '@/lib/allergens';
import { cleanNutritionFacts } from '@/lib/nutrition-facts';
import { deriveVariationSku } from '@/lib/product-sku';
import {
  UNLIMITED_STOCK_VALUE,
  toVariationStockQuantity,
} from '@/lib/product-variation-settings';
import { returnErrorMessage } from '@/lib/toast-error';
import { getVendorPath } from '@/lib/vendor';
import { useCreateProduct } from '@/hooks/api/vendor/deliveries/product-management/products';
import { AppButton } from '@/components/shared/AppButton';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { NutritionAllergensField } from '@/components/shared/form/NutritionAllergensField';
import { ProductPriceField } from '@/components/store/deliveries/product-management/products/add-product/ProductPriceField';
import { VariationStockField } from '@/components/store/deliveries/product-management/products/variation-settings/VariationStockField';
import { VendorVariationAddonsField } from '../variation-settings/VendorVariationAddonsField';
import { ProductBasicsFields } from './ProductBasicsFields';
import { useVendorProductSku } from './useVendorProductSku';

const EMPTY_VALUES: VendorSingleProductFormValues = {
  name: '',
  sku: '',
  menuIds: [],
  categoryId: '',
  subcategoryId: '',
  price: '',
  stockQuantity: UNLIMITED_STOCK_VALUE,
  unitOfMeasure: '',
  addOnIds: [],
  description: '',
  image: undefined,
  nutritionFacts: [],
  allergens: [],
};

/** One-page form for a chain product that is sold as is, with one price. */
export function SingleProductForm() {
  const router = useRouter();
  const { vendorId } = useParams() as { vendorId?: string };
  const t = useTranslations('products.addProduct.single');
  const tSchema = useTranslations();
  const tStep2 = useTranslations('products.addProduct.step2');
  const tErrors = useTranslations('products.errors');
  const [apiError, setApiError] = React.useState<string | null>(null);
  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const { suggestedSku, skuStoreId } = useVendorProductSku();

  const handleSubmit = async (values: VendorSingleProductFormValues) => {
    if (!vendorId) {
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
        store_id: vendorId,
        category_id: values.categoryId,
        subcategory_id: values.subcategoryId || undefined,
        name,
        sku,
        description: values.description || undefined,
        unit_of_measure: values.unitOfMeasure || undefined,
        image: values.image,
        menu_ids: values.menuIds,
        // Sold as is: the API still stores the price, stock and add-ons on one
        // variation, which takes the product's own name and image. Its SKU is
        // not asked: it follows the product SKU as `<sku>-1`.
        variations: [
          {
            name,
            sku: deriveVariationSku(sku, 1) || undefined,
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
      router.push(getVendorPath(vendorId, '/product-management/products'));
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
        validationSchema={vendorSingleProductFormSchema(tSchema, tStep2)}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => {
          const isBusy = isPending || isSubmitting;

          return (
            <Form className="space-y-5">
              <ProductBasicsFields
                vendorId={vendorId}
                suggestedSku={suggestedSku}
                skuStoreId={skuStoreId}
                autoFillSku
                afterUnit={
                  <VendorVariationAddonsField
                    name="addOnIds"
                    vendorId={vendorId}
                    disabled={isBusy}
                    helperText={t('addonsHelper')}
                  />
                }
              >
                <ProductPriceField name="price" showTaxBreakdown={false} />
                <VariationStockField name="stockQuantity" disabled={isBusy} />
              </ProductBasicsFields>

              <NutritionAllergensField
                nutritionName="nutritionFacts"
                allergensName="allergens"
                disabled={isBusy}
                subtitle={t('nutritionSubtitle')}
                allergensEmptyText={t('allergensEmpty')}
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
