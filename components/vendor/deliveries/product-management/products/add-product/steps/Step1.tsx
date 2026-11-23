'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import type { Step1Data } from '@/contexts/vendor/deliveries/product-management/product-form-context';
import { useProductFormContext } from '@/contexts/vendor/deliveries/product-management/product-form-context';
import { vendorProductBasicsSchema } from '@/schemas/vendor/deliveries/product-management/product-form';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { ProductBasicsFields } from '../ProductBasicsFields';

const EMPTY_STEP1: Step1Data = {
  name: '',
  sku: '',
  menuIds: [],
  categoryId: '',
  subcategoryId: '',
  unitOfMeasure: '',
  description: '',
  image: undefined,
};

interface Props {
  /** Product SKU the server reserved for this form; `null` while there is none. */
  suggestedSku: string | null;
  /** Store an edited SKU is checked in; without it no check is made. */
  skuStoreId?: string;
}

/** Step 1 of "Product with variations": details shared by every variation. */
export const Step1Form: React.FC<Props> = ({ suggestedSku, skuStoreId }) => {
  const { nextStep, setStep1Data, formData } = useProductFormContext();
  const { vendorId } = useParams() as { vendorId?: string };
  const t = useTranslations('products.addProduct.step1');
  const tSchema = useTranslations();

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
        validationSchema={vendorProductBasicsSchema(tSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <ProductBasicsFields
              vendorId={vendorId}
              suggestedSku={suggestedSku}
              skuStoreId={skuStoreId}
              // Coming back from step 2 keeps the SKU as it was left, even blank.
              autoFillSku={!formData.step1}
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
