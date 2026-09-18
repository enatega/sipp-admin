'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProductFormContext } from '@/contexts/store/deliveries/product-management/product-form-context';
import type { ApiErrorResponse, ProductVariationFormValue } from '@/types';
import { FieldArray, Form, Formik } from 'formik';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import {
  calculatePriceAfterDeal,
  findDealSummaryById,
} from '@/lib/deal-pricing';
import { formatCurrency } from '@/lib/formatCurrency';
import { getStorePath } from '@/lib/store';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetActiveDeals } from '@/hooks/api/store/deliveries/product-management/deals';
import { useCreateProduct } from '@/hooks/api/store/deliveries/product-management/products';
import { useCurrency } from '@/hooks/use-currency';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';

const createEmptyVariation = (): ProductVariationFormValue => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  price: '',
  image: undefined,
});

type Step2Values = {
  variations: ProductVariationFormValue[];
};

export const Step2Form: React.FC = () => {
  const router = useRouter();
  const { storeId } = useParams() as { storeId?: string };
  const { formData, prevStep, resetForm, setStep2Data } =
    useProductFormContext();
  const t = useTranslations('products.addProduct.step2');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';
  const [apiError, setApiError] = React.useState<string | null>(null);
  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const { data: activeDeals } = useGetActiveDeals(
    storeId
      ? {
          store_id: storeId,
          offset: 0,
          limit: 200,
        }
      : null,
    {
      enabled: !!storeId,
    },
  );
  const selectedDealSummary = findDealSummaryById(
    activeDeals?.data,
    formData.step1?.dealId,
  );

  const initialValues = React.useMemo<Step2Values>(
    () => ({
      variations: formData.step2?.variants?.length
        ? formData.step2.variants
        : [createEmptyVariation()],
    }),
    [formData.step2?.variants],
  );

  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        variations: Yup.array()
          .of(
            Yup.object({
              name: Yup.string().trim().required(t('errors.nameRequired')),
              price: Yup.number()
                .typeError(t('errors.priceRequired'))
                .moreThan(0, t('errors.priceRequired'))
                .required(t('errors.priceRequired')),
              image: Yup.mixed<File | string>()
                .test(
                  'required-image',
                  t('errors.imageRequired'),
                  (value) => value instanceof File,
                )
                .required(t('errors.imageRequired')),
            }),
          )
          .min(1, t('errors.atLeastOneVariant')),
      }),
    [t],
  );

  const handleSubmit = async (
    values: Step2Values,
    setSubmitting: (isSubmitting: boolean) => void,
  ) => {
    const step1 = formData.step1;

    if (!step1 || !storeId) {
      setApiError(t('completeStep1Error'));
      setSubmitting(false);
      return;
    }

    const normalizedVariations = values.variations.map((variation) => ({
      ...variation,
      name: variation.name.trim(),
      price: String(variation.price || '').trim(),
    }));

    const productImages = Array.isArray(step1.images)
      ? step1.images.filter((image): image is File => image instanceof File)
      : [];

    if (productImages.length === 0 || !(step1.image instanceof File)) {
      setApiError('Product image is required');
      setSubmitting(false);
      return;
    }

    setApiError(null);
    setStep2Data({ variants: normalizedVariations });

    try {
      const response = await createProduct({
        store_id: storeId,
        category_id: step1.categoryId,
        subcategory_id: step1.subcategoryId || undefined,
        name: step1.name.trim(),
        price: Number(step1.price),
        taxRateId: step1.taxRateId || undefined,
        stock_quantity: Number(step1.stockQuantity),
        description: step1.description || undefined,
        unit_of_measure: step1.unitOfMeasure || undefined,
        image: step1.image,
        images: productImages,
        addOns: step1.addOnIds,
        deal_ids: step1.dealId ? [step1.dealId] : [],
        variations: normalizedVariations.map((variation) => ({
          name: variation.name,
          price: Number(variation.price),
          image: variation.image instanceof File ? variation.image : undefined,
        })),
      });

      toast.success(response.message || t('productCreatedSuccess'));
      resetForm();
      await router.push(getStorePath(storeId, '/product-management/products'));
    } catch (error) {
      setApiError(returnErrorMessage(error as ApiErrorResponse));
    } finally {
      setSubmitting(false);
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
        onSubmit={async (values, { setSubmitting }) => {
          await handleSubmit(values, setSubmitting);
        }}
      >
        {({ values, errors, touched, isSubmitting }) => (
          <Form className="space-y-5">
            <FieldArray name="variations">
              {({ push, remove }) => (
                <>
                  {values.variations.map((variation, index) => (
                    <div
                      key={variation.id}
                      className="rounded-xl border p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {t('variantLabel')} {index + 1}
                          </p>
                        </div>
                        {index > 0 ? (
                          <AppButton
                            type="button"
                            variant="secondary"
                            onClick={() => remove(index)}
                            disabled={isPending || isSubmitting}
                            leftIcon={<Trash2 className="size-4" />}
                          >
                            {t('deleteButton')}
                          </AppButton>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <AppInputField
                          label={t('nameLabel')}
                          name={`variations.${index}.name`}
                          type="text"
                          placeholder={t('namePlaceholder')}
                          requiredAsterisk
                        />

                        <AppInputField
                          label={`${t('priceLabel')} (${resolvedCurrencySymbol})`}
                          name={`variations.${index}.price`}
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
                      </div>

                      {selectedDealSummary ? (
                        <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                          {t('priceAfterDealLabel')}:{' '}
                          {formatCurrency(
                            calculatePriceAfterDeal(
                              Number(variation.price),
                              selectedDealSummary,
                            ) ?? Number(variation.price),
                            resolvedCurrencySymbol,
                          )}
                        </div>
                      ) : null}

                      <AppFileInput
                        name={`variations.${index}.image`}
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
                    </div>
                  ))}

                  <AppButton
                    type="button"
                    variant="secondary"
                    onClick={() => push(createEmptyVariation())}
                    disabled={isPending || isSubmitting}
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
                disabled={isPending || isSubmitting}
              >
                {t('previousButton')}
              </AppButton>
              <AppButton
                type="submit"
                className="px-12 rounded-[12px]"
                isLoading={isPending || isSubmitting}
                disabled={isPending || isSubmitting}
              >
                {t('submitButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
