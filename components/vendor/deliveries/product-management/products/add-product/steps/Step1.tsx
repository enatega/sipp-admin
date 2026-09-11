'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { UNIT_OF_MEASURE_OPTIONS } from '@/constants/product-form.constants';
import type { Step1Data } from '@/contexts/vendor/deliveries/product-management/product-form-context';
import { useProductFormContext } from '@/contexts/vendor/deliveries/product-management/product-form-context';
import { productFormStep1Schema } from '@/schemas/store/deliveries/product-form';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import VendorAddonsAsyncMultiSelect from '@/components/vendor/deliveries/product-management/common/VendorAddonsAsyncMultiSelect';
import VendorCategoryAsyncSelect from '@/components/vendor/deliveries/product-management/common/VendorCategoryAsyncSelect';
import VendorMenuTemplateAsyncMultiSelect from '@/components/vendor/deliveries/product-management/common/VendorMenuTemplateAsyncMultiSelect';
import VendorSubCategoryAsyncSelect from '@/components/vendor/deliveries/product-management/common/VendorSubCategoryAsyncSelect';
import * as Yup from 'yup';

const EMPTY_STEP1: Step1Data = {
  name: '',
  menuIds: [],
  categoryId: '',
  subcategoryId: '',
  price: '',
  stockQuantity: '',
  addOnIds: [],
  dealId: '',
  unitOfMeasure: '',
  description: '',
  image: undefined,
};

export const Step1Form: React.FC = () => {
  const { nextStep, setStep1Data, formData } = useProductFormContext();
  const { vendorId: storeId } = useParams() as { vendorId?: string };
  const t = useTranslations('products.addProduct.step1');
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

  const initialValues = React.useMemo<Step1Data>(
    () => formData.step1 ?? EMPTY_STEP1,
    [formData.step1],
  );

  const handleSubmit = (values: Step1Data) => {
    setStep1Data(values);
    nextStep();
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
        {({ isSubmitting, values }) => (
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
              />

              <VendorSubCategoryAsyncSelect
                label={t('subcategoryLabel')}
                name="subcategoryId"
                placeholder={t('subcategoryPlaceholder')}
                vendorId={storeId}
                parentCategoryId={values.categoryId}
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

              <VendorAddonsAsyncMultiSelect
                label={t('addonsLabel')}
                name="addOnIds"
                placeholder={t('addonsPlaceholder')}
                vendorId={storeId}
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
              requiredAsterisk
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
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="px-12 h-10 rounded-[12px] mt-6"
              >
                {t('nextButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
