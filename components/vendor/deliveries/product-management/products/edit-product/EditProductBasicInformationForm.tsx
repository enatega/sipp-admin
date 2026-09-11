'use client';

import * as React from 'react';
import { UNIT_OF_MEASURE_OPTIONS } from '@/constants/product-form.constants';
import { productFormStep1Schema } from '@/schemas/store/deliveries/product-form';
import type { EditProductFormValues } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import * as Yup from 'yup';
import type { Product } from '@/types/entities/store/deliveries/product';
import { useCurrency } from '@/hooks/use-currency';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import VendorCategoryAsyncSelect from '@/components/vendor/deliveries/product-management/common/VendorCategoryAsyncSelect';
import VendorMenuTemplateAsyncMultiSelect from '@/components/vendor/deliveries/product-management/common/VendorMenuTemplateAsyncMultiSelect';
import VendorSubCategoryAsyncSelect from '@/components/vendor/deliveries/product-management/common/VendorSubCategoryAsyncSelect';

interface EditProductBasicInformationFormProps {
  initialValues: EditProductFormValues;
  product: Product;
  storeId?: string;
  isSubmitting: boolean;
  disableSubmit?: boolean;
  onSubmit: (values: EditProductFormValues) => void;
}

export function EditProductBasicInformationForm({
  initialValues,
  product,
  storeId,
  isSubmitting,
  disableSubmit,
  onSubmit,
}: EditProductBasicInformationFormProps) {
  const t = useTranslations('products.addProduct.step1');
  const tForm = useTranslations('products.form');
  const tSchema = useTranslations();
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';
  const validationSchema = React.useMemo(
    () =>
      productFormStep1Schema(tSchema).shape({
        menuIds: Yup.array()
          .of(Yup.string().required())
          .min(1, tSchema('products.Schemas.product.menuIdsRequired'))
          .required(tSchema('products.Schemas.product.menuIdsRequired')),
      }),
    [tSchema],
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting: isFormSubmitting, values }) => (
          <Form className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInputField
                label={t('nameLabel')}
                name="name"
                type="text"
                placeholder={t('namePlaceholder')}
                requiredAsterisk
              />

              <VendorMenuTemplateAsyncMultiSelect
                label={t('menuTemplateLabel')}
                name="menuIds"
                placeholder={t('menuTemplatePlaceholder')}
                vendorId={storeId}
                requiredAsterisk
              />

              <VendorCategoryAsyncSelect
                label={t('categoryLabel')}
                name="categoryId"
                placeholder={t('categoryPlaceholder')}
                vendorId={storeId}
                requiredAsterisk
                initialSelectedCategory={
                  product.category
                    ? {
                        id: product.category.id,
                        name:
                          product.category.categoryName ||
                          product.category.name ||
                          '',
                      }
                    : null
                }
              />

              <VendorSubCategoryAsyncSelect
                label={t('subcategoryLabel')}
                name="subcategoryId"
                placeholder={t('subcategoryPlaceholder')}
                vendorId={storeId}
                parentCategoryId={values.categoryId}
                initialSelectedSubCategory={
                  product.subcategory
                    ? {
                        id: product.subcategory.id,
                        name:
                          product.subcategory.categoryName ||
                          product.subcategory.name ||
                          '',
                      }
                    : null
                }
              />

              <AppInputField
                label={`${t('priceLabel')} (${resolvedCurrencySymbol})`}
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder={t('pricePlaceholder')}
                prefix={
                  <span className="font-semibold text-primary">
                    {resolvedCurrencySymbol}
                  </span>
                }
                requiredAsterisk
              />

              <AppInputField
                label={t('stockQuantityLabel')}
                name="stockQuantity"
                type="number"
                min="0"
                placeholder={t('stockQuantityPlaceholder')}
                requiredAsterisk
              />

              <AppSelect
                label={t('unitOfMeasureLabel')}
                name="unitOfMeasure"
                placeholder={t('unitOfMeasurePlaceholder')}
                options={UNIT_OF_MEASURE_OPTIONS}
              />
            </div>

            <AppTextarea
              label={t('descriptionLabel')}
              name="description"
              placeholder={t('descriptionPlaceholder')}
              rows={4}
            />

            <AppFileInput
              name="image"
              label={t('imageLabel')}
              helperText={t('imageHelper')}
              previewUrl={
                typeof initialValues.image === 'string'
                  ? initialValues.image
                  : undefined
              }
              maxSizeMB={5}
              acceptTypes={[
                'image/png',
                'image/jpeg',
                'image/jpg',
                'image/webp',
              ]}
            />

            <div className="flex items-end justify-end">
              <AppButton
                type="submit"
                isLoading={isFormSubmitting || isSubmitting}
                disabled={isFormSubmitting || isSubmitting || disableSubmit}
                className="px-12 h-10 rounded-[12px] mt-6"
              >
                {tForm('updateButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
